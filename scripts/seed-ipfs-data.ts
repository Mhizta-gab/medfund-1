/**
 * Script to seed IPFS database with sample campaign data.
 * This updates the src/utils/ipfs/latest-db-cid.json file with the new CID.
 * 
 * Usage: ts-node scripts/seed-ipfs-data.ts
 * Make sure you have PINATA_JWT environment variable set in your .env file
 */

import * as fs from 'fs';
import * as path from 'path';
import { IPFSManager } from '../src/utils/ipfs/IPFSManager';
import { CampaignMetadata } from '../src/utils/ipfs/schemas/CampaignMetadata';
import { TestimonialMetadata } from '../src/utils/ipfs/schemas/TestimonialMetadata';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if PINATA_JWT is set
if (!process.env.PINATA_JWT) {
  console.error('Error: PINATA_JWT environment variable is not set.');
  console.error('Please set it in your .env file.');
  process.exit(1);
}

// Define paths
const PUBLIC_IMAGES_PATH = path.resolve(__dirname, '../public/images');
const LATEST_DB_CID_PATH = path.resolve(__dirname, '../src/utils/ipfs/latest-db-cid.json');

// Sample campaign data
const campaignsData: Array<{
  campaign: CampaignMetadata;
  imagePath: string;
}> = [
  {
    campaign: {
      id: uuidv4(),
      version: '1.0',
      title: 'Emergency Heart Surgery',
      story: 'John Smith was recently diagnosed with a critical heart condition that requires immediate surgery. His family is unable to afford the costly procedure, and his insurance will only cover a portion. The funds raised will go directly to Central Hospital to cover John\'s surgery and post-operative care.',
      goalAmount: 50000,
      currency: 'ADA',
      category: 'Emergency Care',
      beneficiaryName: 'John Smith',
      raisedAmount: 0,
      donatorCount: 0,
      donationCount: 0,
      created: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      updated: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      status: 'active',
      medicalCondition: {
        summary: 'Critical heart valve defect requiring emergency surgery',
        diagnosisDate: '2023-07-15',
        treatmentPlanSummary: 'Open heart surgery to replace defective heart valve'
      },
      hospitalInfo: {
        name: 'Central Hospital',
        address: '123 Medical Center Blvd, Springfield',
      },
      documentsCIDs: {
        medicalRecords: [],
        verificationDocuments: [],
        additionalFiles: []
      }
    },
    imagePath: path.join(PUBLIC_IMAGES_PATH, 'campaign1.jpeg')
  },
  {
    campaign: {
      id: uuidv4(),
      version: '1.0',
      title: 'Cancer Treatment Support',
      story: 'Sarah Johnson, a 42-year-old mother of two, has been recently diagnosed with stage 2 breast cancer. She needs to undergo chemotherapy and radiation treatment, which will prevent her from working full-time for several months. The funds will help cover her medical expenses and support her family during this difficult time.',
      goalAmount: 75000,
      currency: 'ADA',
      category: 'Cancer Treatment',
      beneficiaryName: 'Sarah Johnson',
      raisedAmount: 0,
      donatorCount: 0,
      donationCount: 0,
      created: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
      updated: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      status: 'active',
      medicalCondition: {
        summary: 'Stage 2 breast cancer requiring chemotherapy and radiation',
        diagnosisDate: '2023-07-05',
        treatmentPlanSummary: 'Six months of chemotherapy followed by radiation therapy'
      },
      hospitalInfo: {
        name: 'Oncology Care Center',
        address: '456 Specialist Avenue, Springfield',
      },
      documentsCIDs: {
        medicalRecords: [],
        verificationDocuments: [],
        additionalFiles: []
      }
    },
    imagePath: path.join(PUBLIC_IMAGES_PATH, 'campaign2.jpg')
  },
  {
    campaign: {
      id: uuidv4(),
      version: '1.0',
      title: 'Pediatric Care Fund',
      story: 'We are raising funds to provide essential medical care for children in rural communities. Many families in these areas lack access to basic pediatric services, resulting in preventable childhood diseases. Your donation will help establish mobile clinics that can reach these underserved areas.',
      goalAmount: 100000,
      currency: 'ADA',
      category: 'Pediatric',
      beneficiaryName: 'Rural Health Initiative',
      raisedAmount: 0,
      donatorCount: 0,
      donationCount: 0,
      created: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
      updated: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      status: 'active',
      medicalCondition: {
        summary: 'Various pediatric conditions in rural communities',
        treatmentPlanSummary: 'Establish mobile clinics and provide preventive care'
      },
      hospitalInfo: {
        name: 'Children\'s Health Foundation',
        address: '789 Community Drive, Springfield',
      },
      documentsCIDs: {
        medicalRecords: [],
        verificationDocuments: [],
        additionalFiles: []
      }
    },
    imagePath: path.join(PUBLIC_IMAGES_PATH, 'campaign3.jpg')
  },
  {
    campaign: {
      id: uuidv4(),
      version: '1.0',
      title: 'Diabetes Management Program',
      story: 'This campaign aims to fund a comprehensive diabetes management program for low-income adults. Many individuals with diabetes struggle to afford the necessary supplies and medications to manage their condition effectively. The program will provide testing supplies, insulin, and educational resources.',
      goalAmount: 35000,
      currency: 'ADA',
      category: 'Chronic Disease',
      beneficiaryName: 'Diabetes Care Initiative',
      raisedAmount: 0,
      donatorCount: 0,
      donationCount: 0,
      created: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
      updated: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      status: 'active',
      medicalCondition: {
        summary: 'Type 1 and Type 2 diabetes in low-income populations',
        treatmentPlanSummary: 'Provide supplies, medication, and education for diabetes management'
      },
      hospitalInfo: {
        name: 'Community Health Clinic',
        address: '321 Public Health Way, Springfield',
      },
      documentsCIDs: {
        medicalRecords: [],
        verificationDocuments: [],
        additionalFiles: []
      }
    },
    imagePath: path.join(PUBLIC_IMAGES_PATH, 'campaign4.jpg')
  }
];

// Sample testimonials
const testimonials: TestimonialMetadata[] = [
  {
    version: '1.0',
    authorName: 'Michael Roberts',
    testimonialText: 'The MedFund platform made it easy for us to raise funds for my daughter\'s surgery. The transparent blockchain process gave our donors confidence that the funds were going directly to her treatment.',
    rating: 5,
    created: Date.now() - 30 * 24 * 60 * 60 * 1000,
    verified: true,
    location: 'Austin, TX',
    status: 'approved',
  },
  {
    version: '1.0',
    authorName: 'Jennifer Liu',
    testimonialText: 'After my cancer diagnosis, I was worried about how I would afford treatment. Thanks to the generous donors on MedFund, I was able to focus on recovery instead of financial stress.',
    rating: 5,
    created: Date.now() - 45 * 24 * 60 * 60 * 1000,
    verified: true,
    location: 'Chicago, IL',
    status: 'approved',
  }
];

/**
 * Read an image file and convert it to base64
 */
async function imageToBase64(imagePath: string): Promise<{base64: string, mimeType: string}> {
  return new Promise((resolve, reject) => {
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      // Determine mime type based on file extension
      let mimeType = 'image/jpeg'; // Default
      if (imagePath.toLowerCase().endsWith('.png')) {
        mimeType = 'image/png';
      } else if (imagePath.toLowerCase().endsWith('.jpg') || imagePath.toLowerCase().endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (imagePath.toLowerCase().endsWith('.gif')) {
        mimeType = 'image/gif';
      }

      // Convert to base64
      const base64 = `data:${mimeType};base64,${data.toString('base64')}`;
      resolve({base64, mimeType});
    });
  });
}

/**
 * Update the latest-db-cid.json file with the new CID
 */
function updateLatestDbCid(cid: string): void {
  const data = {
    databaseCID: cid,
    updatedAt: new Date().toISOString(),
    description: "This file tracks the latest IPFS database CID for the MedFund application"
  };

  fs.writeFileSync(LATEST_DB_CID_PATH, JSON.stringify(data, null, 2));
  console.log(`Updated ${LATEST_DB_CID_PATH} with new CID: ${cid}`);
}

/**
 * Main function to seed IPFS with data
 */
async function seedIPFSData() {
  console.log('Starting IPFS data seeding...');
  
  // Initialize IPFS Manager
  const ipfsManager = new IPFSManager();
  
  // Create empty database to start fresh
  console.log('Creating empty IPFS database...');
  const dbCid = await ipfsManager.createEmptyDatabase();
  console.log(`Empty database created with CID: ${dbCid}`);
  
  // Load database to work with it
  await ipfsManager.loadDatabase(dbCid);
  
  // Process and upload each campaign
  console.log('\nUploading campaigns:');
  for (const [index, campaignData] of campaignsData.entries()) {
    try {
      console.log(`\nProcessing campaign ${index + 1}/${campaignsData.length}: ${campaignData.campaign.title}`);
      
      // Read and convert image to base64
      console.log(`Reading image: ${campaignData.imagePath}`);
      const imageData = await imageToBase64(campaignData.imagePath);
      
      // Prepare image upload data
      const images = [{
        key: 'campaignImage',
        base64: imageData.base64,
        mimeType: imageData.mimeType
      }];
      
      // Upload campaign with image
      console.log(`Uploading campaign: ${campaignData.campaign.title}`);
      const campaignCid = await ipfsManager.uploadCampaign({
        campaign: campaignData.campaign,
        images
      });
      
      console.log(`Campaign uploaded successfully with CID: ${campaignCid}`);
      
    } catch (error) {
      console.error(`Error uploading campaign ${campaignData.campaign.title}:`, error);
    }
  }
  
  // Upload testimonials
  console.log('\nUploading testimonials:');
  for (const [index, testimonial] of testimonials.entries()) {
    try {
      console.log(`\nProcessing testimonial ${index + 1}/${testimonials.length} from ${testimonial.authorName}`);
      
      // Upload testimonial
      const testimonialCid = await ipfsManager.uploadTestimonial(testimonial);
      console.log(`Testimonial uploaded successfully with CID: ${testimonialCid}`);
      
    } catch (error) {
      console.error(`Error uploading testimonial from ${testimonial.authorName}:`, error);
    }
  }
  
  // Save the final database
  console.log('\nSaving final database...');
  const finalCid = await ipfsManager.saveDatabase();
  console.log(`Final database saved with CID: ${finalCid}`);
  
  // Update the latest-db-cid.json file
  updateLatestDbCid(finalCid);
  
  console.log('\nIPFS data seeding completed successfully!');
}

// Run the script
seedIPFSData().catch(error => {
  console.error('Error in seed script:', error);
  process.exit(1);
}); 