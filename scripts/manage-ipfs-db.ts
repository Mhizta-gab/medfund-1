import { program } from 'commander';
import { v4 as uuidv4 } from 'uuid';
import { IPFSManager } from '../src/utils/ipfs/IPFSManager';
import { CampaignMetadata } from '../src/utils/ipfs/schemas/CampaignMetadata';
import type { CampaignStatus } from '../src/utils/ipfs/schemas/CampaignMetadata'; // Correctly import type
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// Replicate the CampaignData interface expected by IPFSManager.uploadCampaign
interface CliCampaignUploadData {
  campaign: CampaignMetadata;
  images: {
    key: string;
    base64: string;
    mimeType: string;
  }[];
}

// Helper to create IPFSManager and check configuration
async function getIPFSManager(): Promise<IPFSManager> {
  const manager = new IPFSManager();
  if (!manager.isConfigured) {
    console.error(
      'Error: Pinata JWT token is not configured. \n' +
        'Please set the PINATA_JWT environment variable in your .env file (e.g., PINATA_JWT=your_token). \n' +
        'You can get a JWT token from your Pinata account (API Keys page).'
    );
    process.exit(1);
  }
  return manager;
}

program
  .name('manage-ipfs-db')
  .description('CLI tool to manage MedFund campaign database on IPFS');

program
  .command('init')
  .description('Initializes a new empty campaign database on IPFS and prints its CID.')
  .action(async () => {
    console.log('Initializing new IPFS database...');
    const manager = await getIPFSManager();
    try {
      const cid = await manager.createEmptyDatabase();
      console.log('----------------------------------------------------------------');
      console.log('SUCCESS: New empty database created!');
      console.log(`Database CID: ${cid}`);
      console.log('Store this CID. You will need it for other operations.');
      console.log('----------------------------------------------------------------');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    }
  });

program
  .command('add-campaign <databaseCID>')
  .description('Adds a new campaign to the specified IPFS database.')
  .requiredOption('-t, --title <string>', 'Campaign title')
  .requiredOption('-s, --story <string>', 'Campaign story/description')
  .requiredOption('-g, --goal <number>', 'Goal amount (in lovelace for ADA)', parseFloat)
  .option('-c, --currency <string>', 'Currency code (e.g., ADA)', 'ADA')
  .option('--category <string>', 'Campaign category', 'Medical')
  .option('--status <status>', 'Campaign status (draft, pending_verification, active, completed, on_hold, cancelled)', 'draft')
  .option('--organizerId <string>', 'Organizer ID (e.g., wallet address)')
  .option('--endDate <timestamp>', 'End date timestamp (Unix epoch in milliseconds)', (value) => parseInt(value, 10))
  // TODO: Add options for all other CampaignMetadata fields (images, docs, hospitalInfo, etc.)
  .action(async (databaseCID: string, options: any) => {
    console.log(`Adding new campaign to database: ${databaseCID}...`);
    const manager = await getIPFSManager();
    try {
      await manager.loadDatabase(databaseCID); // Load the main database

      const campaignId = uuidv4();
      const now = Date.now();

      const newCampaign: CampaignMetadata = {
        id: campaignId,
        version: '1.0',
        title: options.title,
        story: options.story,
        goalAmount: options.goal,
        currency: options.currency,
        category: options.category,
        status: options.status as CampaignStatus,
        organizerId: options.organizerId,
        endDate: options.endDate,
        created: now,
        updated: now,
        raisedAmount: 0,
        donatorCount: 0,
        donationCount: 0,
        documentsCIDs: { medicalRecords: [], verificationDocuments: [], additionalFiles: [] },
        // Initialize other complex fields as needed or add more CLI options
      };

      const campaignDataForUpload: CliCampaignUploadData = {
        campaign: newCampaign,
        images: [], // For CLI, direct image upload is complex. Assume CIDs are handled separately or added later.
      };

      console.log('Uploading campaign metadata (this will also update and save the main database)...');
      // uploadCampaign from IPFSManager handles adding the campaign to its loaded `this.database` 
      // and then calls `this.saveDatabase()` which uploads the *entire database* and returns the new DB CID.
      // The actual campaign's own CID is returned by pinataService.uploadCampaignMetadata, 
      // but IPFSManager.uploadCampaign returns that specific campaign's CID.
      const individualCampaignCID = await manager.uploadCampaign(campaignDataForUpload);
      // The new database CID is logged by IPFSManager.saveDatabase()

      console.log('----------------------------------------------------------------');
      console.log(`SUCCESS: Campaign added with ID: ${campaignId}`);
      console.log(`Individual Campaign Metadata CID: ${individualCampaignCID}`);
      console.log('The main campaign database has been updated on IPFS.');
      console.log('The NEW Database CID was logged by IPFSManager (e.g., \"Database saved. New CID: QmXyZ...\").');
      console.log('Please use that NEW Database CID for subsequent operations.');
      console.log('----------------------------------------------------------------');

    } catch (error) {
      console.error('Failed to add campaign:', error);
      process.exit(1);
    }
  });

program
  .command('update-funding <databaseCID> <campaignId>')
  .description('Updates the funding status of a campaign in the IPFS database.')
  .requiredOption('-r, --raised <number>', 'New total raised amount', parseFloat)
  .requiredOption('--donators <number>', 'New total unique donator count', parseInt)
  .requiredOption('--donations <number>', 'New total donation transaction count', parseInt)
  .action(async (databaseCID: string, campaignId: string, options: any) => {
    console.log(`Updating funding for campaign ${campaignId} in database ${databaseCID}...`);
    const manager = await getIPFSManager();
    try {
      const db = await manager.loadDatabase(databaseCID);
      const campaignIndex = db.campaigns.findIndex(c => c.id === campaignId);

      if (campaignIndex === -1) {
        console.error(`Error: Campaign with ID ${campaignId} not found in database ${databaseCID}.`);
        process.exit(1);
      }

      // Create a new object for the campaign to ensure re-upload if values are the same (due to object reference)
      const updatedCampaign = {
        ...db.campaigns[campaignIndex],
        raisedAmount: options.raised,
        donatorCount: options.donators,
        donationCount: options.donations,
        updated: Date.now(),
      };
      db.campaigns[campaignIndex] = updatedCampaign;

      console.log('Saving updated database to IPFS...');
      // This directly calls the public saveDatabase on the manager, which has the modified campaign list.
      const newDatabaseCID = await manager.saveDatabase(); 
      
      console.log('----------------------------------------------------------------');
      console.log(`SUCCESS: Funding updated for campaign ${campaignId}.`);
      console.log(`The main database has been updated on IPFS.`);
      console.log(`NEW Database CID: ${newDatabaseCID} (also logged by IPFSManager).`);
      console.log('Please use this NEW Database CID for future operations.');
      console.log('----------------------------------------------------------------');

    } catch (error) {
      console.error('Failed to update campaign funding:', error);
      process.exit(1);
    }
  });

program
  .command('get-campaign <databaseCID> <campaignId>')
  .description('Retrieves and displays a specific campaign from the IPFS database.')
  .action(async (databaseCID: string, campaignId: string) => {
    console.log(`Fetching campaign ${campaignId} from database ${databaseCID}...`);
    const manager = await getIPFSManager();
    try {
      const db = await manager.loadDatabase(databaseCID);
      const campaign = db.campaigns.find(c => c.id === campaignId);

      if (!campaign) {
        console.error(`Error: Campaign with ID ${campaignId} not found in database ${databaseCID}.`);
        process.exit(1);
      }
      console.log('---------------------- Campaign Details ----------------------');
      console.log(JSON.stringify(campaign, null, 2));
      console.log('----------------------------------------------------------------');
    } catch (error) {
      console.error('Failed to get campaign:', error);
      process.exit(1);
    }
  });

program
  .command('list-campaigns <databaseCID>')
  .description('Lists all campaigns in the specified IPFS database.')
  .action(async (databaseCID: string) => {
    console.log(`Listing all campaigns from database ${databaseCID}...`);
    const manager = await getIPFSManager();
    try {
      const db = await manager.loadDatabase(databaseCID);
      console.log('----------------------- All Campaigns ------------------------');
      if (db.campaigns.length === 0) {
        console.log('No campaigns found in this database.');
      }
      db.campaigns.forEach(campaign => {
        console.log(JSON.stringify(campaign, null, 2));
        console.log('---');
      });
      console.log('----------------------------------------------------------------');
    } catch (error) {
      console.error('Failed to list campaigns:', error);
      process.exit(1);
    }
  });

async function main() {
  // For this script to use .env variables like PINATA_JWT,
  // you might need to load them if your execution environment doesn't do it automatically.
  // e.g., by running: node -r dotenv/config scripts/manage-ipfs-db.js <command>
  // Or, add at the top of this script (if dotenv is a dev dependency):
  // import dotenv from 'dotenv';
  // import path from 'path';
  // dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Adjust path as needed

  await program.parseAsync(process.argv);
}

main().catch(err => {
  console.error('Unhandled error in script:', err);
  process.exit(1);
}); 