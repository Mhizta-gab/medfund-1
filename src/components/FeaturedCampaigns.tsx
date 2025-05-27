'use client';

import CampaignCard from './CampaignCard';

// Mock data for featured campaigns
const featuredCampaigns = [
  {
    id: '1',
    title: 'Emergency Heart Surgery',
    description: 'Help John get life-saving heart surgery',
    goal: 50000,
    raised: 25000,
    imageUrl: '/images/campaign1.jpeg',
    category: 'Surgery',
    urgency: 'High',
  },
  {
    id: '2',
    title: 'Cancer Treatment Fund',
    description: 'Support Sarah\'s cancer treatment journey',
    goal: 75000,
    raised: 50000,
    imageUrl: '/images/campaign2.jpg',
    category: 'Treatment',
    urgency: 'High',
  },
  {
    id: '3',
    title: 'Pediatric Care Fund',
    description: 'Help children in need of medical care',
    goal: 100000,
    raised: 75000,
    imageUrl: '/images/campaign3.jpg',
    category: 'Pediatric',
    urgency: 'Medium',
  },
];

const FeaturedCampaigns = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Featured Campaigns
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Help these urgent medical cases today
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCampaigns; 