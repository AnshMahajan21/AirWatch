/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Comprehensive Delhi NCR Neighborhoods & Localities
 * Covers all 11 Revenue Districts of Delhi + NCR satellite hubs:
 * North Delhi, South Delhi, East Delhi, West Delhi, Central Delhi,
 * North East Delhi, North West Delhi, South East Delhi, South West Delhi, New Delhi.
 * Supports GPS geolocation distance matching and instant full-text search.
 */

export interface DelhiLocation {
  id: string;
  name: string;
  district: string;
  lat: number;
  lon: number;
  type: 'Residential' | 'Commercial' | 'Heritage' | 'Industrial' | 'Diplomatic' | 'Transit';
  cpcbStationNear?: string;
}

export const DELHI_DISTRICTS = [
  'All',
  'Central Delhi',
  'New Delhi',
  'South Delhi',
  'South East Delhi',
  'South West Delhi',
  'East Delhi',
  'North East Delhi',
  'North Delhi',
  'North West Delhi',
  'West Delhi',
  'NCR',
] as const;

export const ALL_DELHI_LOCATIONS: DelhiLocation[] = [
  // --- East Delhi ---
  { id: 'anand-vihar', name: 'Anand Vihar', district: 'East Delhi', lat: 28.6502, lon: 77.3150, type: 'Transit', cpcbStationNear: 'Anand Vihar CAAQMS' },
  { id: 'laxmi-nagar', name: 'Laxmi Nagar', district: 'East Delhi', lat: 28.6309, lon: 77.2773, type: 'Commercial', cpcbStationNear: 'Patparganj' },
  { id: 'preet-vihar', name: 'Preet Vihar', district: 'East Delhi', lat: 28.6415, lon: 77.2965, type: 'Residential', cpcbStationNear: 'Patparganj' },
  { id: 'nirman-vihar', name: 'Nirman Vihar', district: 'East Delhi', lat: 28.6366, lon: 77.2874, type: 'Residential', cpcbStationNear: 'Patparganj' },
  { id: 'patparganj', name: 'Patparganj', district: 'East Delhi', lat: 28.6237, lon: 77.2872, type: 'Industrial', cpcbStationNear: 'Patparganj CAAQMS' },
  { id: 'mayur-vihar', name: 'Mayur Vihar', district: 'East Delhi', lat: 28.5925, lon: 77.2974, type: 'Residential', cpcbStationNear: 'Patparganj' },
  { id: 'pandav-nagar', name: 'Pandav Nagar', district: 'East Delhi', lat: 28.6186, lon: 77.2879, type: 'Residential', cpcbStationNear: 'Patparganj' },
  { id: 'shakarpur', name: 'Shakarpur', district: 'East Delhi', lat: 28.6300, lon: 77.2800, type: 'Residential', cpcbStationNear: 'Patparganj' },
  { id: 'krishna-nagar', name: 'Krishna Nagar', district: 'East Delhi', lat: 28.6575, lon: 77.2811, type: 'Commercial', cpcbStationNear: 'Vivek Vihar' },
  { id: 'geeta-colony', name: 'Geeta Colony', district: 'East Delhi', lat: 28.6483, lon: 77.2683, type: 'Residential', cpcbStationNear: 'ITO' },
  { id: 'gandhi-nagar', name: 'Gandhi Nagar', district: 'East Delhi', lat: 28.6592, lon: 77.2678, type: 'Commercial', cpcbStationNear: 'ITO' },
  { id: 'karkardooma', name: 'Karkardooma', district: 'East Delhi', lat: 28.6528, lon: 77.3015, type: 'Commercial', cpcbStationNear: 'Anand Vihar' },

  // --- Central Delhi ---
  { id: 'ito', name: 'ITO', district: 'Central Delhi', lat: 28.6304, lon: 77.2435, type: 'Commercial', cpcbStationNear: 'ITO CAAQMS' },
  { id: 'karol-bagh', name: 'Karol Bagh', district: 'Central Delhi', lat: 28.6517, lon: 77.1907, type: 'Commercial', cpcbStationNear: 'Pusa' },
  { id: 'paharganj', name: 'Paharganj', district: 'Central Delhi', lat: 28.6434, lon: 77.2144, type: 'Commercial', cpcbStationNear: 'Mandir Marg' },
  { id: 'daryaganj', name: 'Daryaganj', district: 'Central Delhi', lat: 28.6427, lon: 77.2425, type: 'Heritage', cpcbStationNear: 'ITO' },
  { id: 'chandni-chowk', name: 'Chandni Chowk', district: 'Central Delhi', lat: 28.6506, lon: 77.2303, type: 'Heritage', cpcbStationNear: 'Chandni Chowk CAAQMS' },
  { id: 'sadar-bazaar', name: 'Sadar Bazaar', district: 'Central Delhi', lat: 28.6582, lon: 77.2131, type: 'Commercial', cpcbStationNear: 'Chandni Chowk' },
  { id: 'patel-nagar', name: 'Patel Nagar', district: 'Central Delhi', lat: 28.6565, lon: 77.1650, type: 'Residential', cpcbStationNear: 'Shadipur' },
  { id: 'rajendra-place', name: 'Rajendra Place', district: 'Central Delhi', lat: 28.6439, lon: 77.1784, type: 'Commercial', cpcbStationNear: 'Pusa' },
  { id: 'jhandewalan', name: 'Jhandewalan', district: 'Central Delhi', lat: 28.6450, lon: 77.1990, type: 'Commercial', cpcbStationNear: 'Mandir Marg' },

  // --- New Delhi ---
  { id: 'connaught-place', name: 'Connaught Place', district: 'New Delhi', lat: 28.6315, lon: 77.2167, type: 'Commercial', cpcbStationNear: 'Mandir Marg' },
  { id: 'india-gate', name: 'India Gate', district: 'New Delhi', lat: 28.6129, lon: 77.2295, type: 'Heritage', cpcbStationNear: 'Major Dhyan Chand Stadium' },
  { id: 'chanakyapuri', name: 'Chanakyapuri', district: 'New Delhi', lat: 28.5950, lon: 77.1900, type: 'Diplomatic', cpcbStationNear: 'RK Puram' },
  { id: 'lodhi-estate', name: 'Lodhi Estate', district: 'New Delhi', lat: 28.5910, lon: 77.2230, type: 'Residential', cpcbStationNear: 'Lodhi Road' },
  { id: 'jor-bagh', name: 'Jor Bagh', district: 'New Delhi', lat: 28.5878, lon: 77.2165, type: 'Residential', cpcbStationNear: 'Lodhi Road' },
  { id: 'khan-market', name: 'Khan Market', district: 'New Delhi', lat: 28.6000, lon: 77.2270, type: 'Commercial', cpcbStationNear: 'Lodhi Road' },
  { id: 'sarojini-nagar', name: 'Sarojini Nagar', district: 'New Delhi', lat: 28.5770, lon: 77.1980, type: 'Commercial', cpcbStationNear: 'RK Puram' },
  { id: 'ina', name: 'INA', district: 'New Delhi', lat: 28.5750, lon: 77.2100, type: 'Commercial', cpcbStationNear: 'Lodhi Road' },
  { id: 'lutyens-delhi', name: "Lutyens' Delhi", district: 'New Delhi', lat: 28.6100, lon: 77.2100, type: 'Diplomatic', cpcbStationNear: 'Mandir Marg' },
  { id: 'gole-market', name: 'Gole Market', district: 'New Delhi', lat: 28.6320, lon: 77.2030, type: 'Residential', cpcbStationNear: 'Mandir Marg' },
  { id: 'janpath', name: 'Janpath', district: 'New Delhi', lat: 28.6220, lon: 77.2190, type: 'Commercial', cpcbStationNear: 'Mandir Marg' },

  // --- South Delhi ---
  { id: 'saket', name: 'Saket', district: 'South Delhi', lat: 28.5244, lon: 77.2100, type: 'Commercial', cpcbStationNear: 'Sri Aurobindo Marg' },
  { id: 'hauz-khas', name: 'Hauz Khas', district: 'South Delhi', lat: 28.5494, lon: 77.2001, type: 'Heritage', cpcbStationNear: 'IIT Delhi CAAQMS' },
  { id: 'malviya-nagar', name: 'Malviya Nagar', district: 'South Delhi', lat: 28.5350, lon: 77.2100, type: 'Residential', cpcbStationNear: 'IIT Delhi' },
  { id: 'mehrauli', name: 'Mehrauli', district: 'South Delhi', lat: 28.5175, lon: 77.1831, type: 'Heritage', cpcbStationNear: 'Ayanagar' },
  { id: 'greater-kailash', name: 'Greater Kailash', district: 'South Delhi', lat: 28.5400, lon: 77.2350, type: 'Residential', cpcbStationNear: 'Nehru Nagar' },
  { id: 'defence-colony', name: 'Defence Colony', district: 'South Delhi', lat: 28.5720, lon: 77.2300, type: 'Residential', cpcbStationNear: 'Lodhi Road' },
  { id: 'lajpat-nagar', name: 'Lajpat Nagar', district: 'South Delhi', lat: 28.5670, lon: 77.2430, type: 'Commercial', cpcbStationNear: 'Nehru Nagar' },
  { id: 'chhatarpur', name: 'Chhatarpur', district: 'South Delhi', lat: 28.5020, lon: 77.1800, type: 'Residential', cpcbStationNear: 'Ayanagar' },
  { id: 'vasant-kunj', name: 'Vasant Kunj', district: 'South Delhi', lat: 28.5200, lon: 77.1500, type: 'Residential', cpcbStationNear: 'Jawaharlal Nehru University' },
  { id: 'green-park', name: 'Green Park', district: 'South Delhi', lat: 28.5580, lon: 77.2040, type: 'Residential', cpcbStationNear: 'IIT Delhi' },
  { id: 'south-extension', name: 'South Extension', district: 'South Delhi', lat: 28.5710, lon: 77.2200, type: 'Commercial', cpcbStationNear: 'Lodhi Road' },
  { id: 'panchsheel-park', name: 'Panchsheel Park', district: 'South Delhi', lat: 28.5430, lon: 77.2150, type: 'Residential', cpcbStationNear: 'IIT Delhi' },
  { id: 'sangam-vihar', name: 'Sangam Vihar', district: 'South Delhi', lat: 28.5000, lon: 77.2400, type: 'Residential', cpcbStationNear: 'Dr. Karni Singh Range' },

  // --- South East Delhi ---
  { id: 'kalkaji', name: 'Kalkaji', district: 'South East Delhi', lat: 28.5420, lon: 77.2550, type: 'Residential', cpcbStationNear: 'Nehru Nagar' },
  { id: 'okhla', name: 'Okhla', district: 'South East Delhi', lat: 28.5307, lon: 77.2713, type: 'Industrial', cpcbStationNear: 'Okhla Phase-2 CAAQMS' },
  { id: 'jamia-nagar', name: 'Jamia Nagar', district: 'South East Delhi', lat: 28.5600, lon: 77.2800, type: 'Residential', cpcbStationNear: 'Okhla' },
  { id: 'jasola', name: 'Jasola', district: 'South East Delhi', lat: 28.5400, lon: 77.2900, type: 'Commercial', cpcbStationNear: 'Okhla' },
  { id: 'sarita-vihar', name: 'Sarita Vihar', district: 'South East Delhi', lat: 28.5300, lon: 77.3000, type: 'Residential', cpcbStationNear: 'Okhla' },
  { id: 'new-friends-colony', name: 'New Friends Colony', district: 'South East Delhi', lat: 28.5650, lon: 77.2700, type: 'Residential', cpcbStationNear: 'Nehru Nagar' },
  { id: 'sukhdev-vihar', name: 'Sukhdev Vihar', district: 'South East Delhi', lat: 28.5550, lon: 77.2750, type: 'Residential', cpcbStationNear: 'Okhla' },
  { id: 'govindpuri', name: 'Govindpuri', district: 'South East Delhi', lat: 28.5350, lon: 77.2600, type: 'Residential', cpcbStationNear: 'Okhla' },
  { id: 'tughlakabad', name: 'Tughlakabad', district: 'South East Delhi', lat: 28.5100, lon: 77.2600, type: 'Heritage', cpcbStationNear: 'Dr. Karni Singh Shooting Range' },
  { id: 'badarpur', name: 'Badarpur', district: 'South East Delhi', lat: 28.5000, lon: 77.3000, type: 'Industrial', cpcbStationNear: 'Okhla' },
  { id: 'jaitpur', name: 'Jaitpur', district: 'South East Delhi', lat: 28.5150, lon: 77.3200, type: 'Residential', cpcbStationNear: 'Okhla' },
  { id: 'mohan-cooperative', name: 'Mohan Cooperative Industrial Estate', district: 'South East Delhi', lat: 28.5180, lon: 77.3050, type: 'Industrial', cpcbStationNear: 'Okhla' },

  // --- North Delhi ---
  { id: 'civil-lines', name: 'Civil Lines', district: 'North Delhi', lat: 28.6800, lon: 77.2250, type: 'Residential', cpcbStationNear: 'Civil Lines CAAQMS' },
  { id: 'kamla-nagar', name: 'Kamla Nagar', district: 'North Delhi', lat: 28.6810, lon: 77.2010, type: 'Commercial', cpcbStationNear: 'North Campus' },
  { id: 'model-town', name: 'Model Town', district: 'North Delhi', lat: 28.7050, lon: 77.1920, type: 'Residential', cpcbStationNear: 'Jahangirpuri' },
  { id: 'mukherjee-nagar', name: 'Mukherjee Nagar', district: 'North Delhi', lat: 28.7100, lon: 77.2100, type: 'Commercial', cpcbStationNear: 'Jahangirpuri' },
  { id: 'kingsway-camp', name: 'Kingsway Camp', district: 'North Delhi', lat: 28.6980, lon: 77.2050, type: 'Transit', cpcbStationNear: 'North Campus' },
  { id: 'burari', name: 'Burari', district: 'North Delhi', lat: 28.7500, lon: 77.2000, type: 'Residential', cpcbStationNear: 'Burari Crossing CAAQMS' },
  { id: 'timarpur', name: 'Timarpur', district: 'North Delhi', lat: 28.6920, lon: 77.2200, type: 'Residential', cpcbStationNear: 'Civil Lines' },
  { id: 'roop-nagar', name: 'Roop Nagar', district: 'North Delhi', lat: 28.6800, lon: 77.2000, type: 'Residential', cpcbStationNear: 'North Campus' },
  { id: 'majnu-ka-tilla', name: 'Majnu Ka Tilla', district: 'North Delhi', lat: 28.7000, lon: 77.2280, type: 'Heritage', cpcbStationNear: 'Civil Lines' },
  { id: 'wazirpur', name: 'Wazirpur', district: 'North Delhi', lat: 28.6997, lon: 77.1654, type: 'Industrial', cpcbStationNear: 'Wazirpur CAAQMS' },
  { id: 'alipur', name: 'Alipur', district: 'North Delhi', lat: 28.7972, lon: 77.1331, type: 'Residential', cpcbStationNear: 'Alipur CAAQMS' },

  // --- North West Delhi ---
  { id: 'rohini', name: 'Rohini', district: 'North West Delhi', lat: 28.7495, lon: 77.0736, type: 'Residential', cpcbStationNear: 'Rohini Sector 16 CAAQMS' },
  { id: 'pitampura', name: 'Pitampura', district: 'North West Delhi', lat: 28.7000, lon: 77.1300, type: 'Residential', cpcbStationNear: 'Wazirpur' },
  { id: 'shalimar-bagh', name: 'Shalimar Bagh', district: 'North West Delhi', lat: 28.7150, lon: 77.1550, type: 'Residential', cpcbStationNear: 'Wazirpur' },
  { id: 'ashok-vihar', name: 'Ashok Vihar', district: 'North West Delhi', lat: 28.6954, lon: 77.1817, type: 'Residential', cpcbStationNear: 'Ashok Vihar CAAQMS' },
  { id: 'mangolpuri', name: 'Mangolpuri', district: 'North West Delhi', lat: 28.6950, lon: 77.0850, type: 'Residential', cpcbStationNear: 'Rohini' },
  { id: 'sultanpuri', name: 'Sultanpuri', district: 'North West Delhi', lat: 28.7050, lon: 77.0750, type: 'Residential', cpcbStationNear: 'Rohini' },
  { id: 'bawana', name: 'Bawana', district: 'North West Delhi', lat: 28.7762, lon: 77.0511, type: 'Industrial', cpcbStationNear: 'Bawana CAAQMS' },
  { id: 'narela', name: 'Narela', district: 'North West Delhi', lat: 28.8530, lon: 77.0931, type: 'Industrial', cpcbStationNear: 'Narela CAAQMS' },
  { id: 'jahangirpuri', name: 'Jahangirpuri', district: 'North West Delhi', lat: 28.7325, lon: 77.1706, type: 'Residential', cpcbStationNear: 'Jahangirpuri CAAQMS' },
  { id: 'adarsh-nagar', name: 'Adarsh Nagar', district: 'North West Delhi', lat: 28.7180, lon: 77.1780, type: 'Residential', cpcbStationNear: 'Jahangirpuri' },
  { id: 'rani-bagh', name: 'Rani Bagh', district: 'North West Delhi', lat: 28.6900, lon: 77.1250, type: 'Commercial', cpcbStationNear: 'Punjabi Bagh' },

  // --- North East Delhi ---
  { id: 'shahdara', name: 'Shahdara', district: 'North East Delhi', lat: 28.6750, lon: 77.2950, type: 'Commercial', cpcbStationNear: 'Vivek Vihar' },
  { id: 'seelampur', name: 'Seelampur', district: 'North East Delhi', lat: 28.6690, lon: 77.2680, type: 'Commercial', cpcbStationNear: 'Sonia Vihar' },
  { id: 'yamuna-vihar', name: 'Yamuna Vihar', district: 'North East Delhi', lat: 28.6970, lon: 77.2750, type: 'Residential', cpcbStationNear: 'Sonia Vihar' },
  { id: 'bhajanpura', name: 'Bhajanpura', district: 'North East Delhi', lat: 28.7020, lon: 77.2680, type: 'Residential', cpcbStationNear: 'Sonia Vihar' },
  { id: 'maujpur', name: 'Maujpur', district: 'North East Delhi', lat: 28.6850, lon: 77.2780, type: 'Residential', cpcbStationNear: 'Sonia Vihar' },
  { id: 'babarpur', name: 'Babarpur', district: 'North East Delhi', lat: 28.6880, lon: 77.2850, type: 'Residential', cpcbStationNear: 'Vivek Vihar' },
  { id: 'gokalpuri', name: 'Gokalpuri', district: 'North East Delhi', lat: 28.7050, lon: 77.2850, type: 'Residential', cpcbStationNear: 'Sonia Vihar' },
  { id: 'karawal-nagar', name: 'Karawal Nagar', district: 'North East Delhi', lat: 28.7250, lon: 77.2750, type: 'Residential', cpcbStationNear: 'Sonia Vihar' },
  { id: 'khajuri-khas', name: 'Khajuri Khas', district: 'North East Delhi', lat: 28.7150, lon: 77.2550, type: 'Residential', cpcbStationNear: 'Sonia Vihar' },
  { id: 'dilshad-garden', name: 'Dilshad Garden', district: 'North East Delhi', lat: 28.6815, lon: 77.3180, type: 'Residential', cpcbStationNear: 'IHBAS CAAQMS' },
  { id: 'nand-nagri', name: 'Nand Nagri', district: 'North East Delhi', lat: 28.6960, lon: 77.3080, type: 'Residential', cpcbStationNear: 'IHBAS' },

  // --- West Delhi ---
  { id: 'rajouri-garden', name: 'Rajouri Garden', district: 'West Delhi', lat: 28.6470, lon: 77.1230, type: 'Commercial', cpcbStationNear: 'Punjabi Bagh' },
  { id: 'janakpuri', name: 'Janakpuri', district: 'West Delhi', lat: 28.6219, lon: 77.0878, type: 'Residential', cpcbStationNear: 'Dwarka' },
  { id: 'tilak-nagar', name: 'Tilak Nagar', district: 'West Delhi', lat: 28.6360, lon: 77.0960, type: 'Commercial', cpcbStationNear: 'Janakpuri' },
  { id: 'punjabi-bagh', name: 'Punjabi Bagh', district: 'West Delhi', lat: 28.6722, lon: 77.1311, type: 'Residential', cpcbStationNear: 'Punjabi Bagh CAAQMS' },
  { id: 'paschim-vihar', name: 'Paschim Vihar', district: 'West Delhi', lat: 28.6700, lon: 77.1000, type: 'Residential', cpcbStationNear: 'Punjabi Bagh' },
  { id: 'vikaspuri', name: 'Vikaspuri', district: 'West Delhi', lat: 28.6350, lon: 77.0700, type: 'Residential', cpcbStationNear: 'Dwarka' },
  { id: 'uttam-nagar', name: 'Uttam Nagar', district: 'West Delhi', lat: 28.6220, lon: 77.0580, type: 'Residential', cpcbStationNear: 'Dwarka' },
  { id: 'subhash-nagar', name: 'Subhash Nagar', district: 'West Delhi', lat: 28.6400, lon: 77.1100, type: 'Residential', cpcbStationNear: 'Punjabi Bagh' },
  { id: 'hari-nagar', name: 'Hari Nagar', district: 'West Delhi', lat: 28.6280, lon: 77.1050, type: 'Residential', cpcbStationNear: 'Punjabi Bagh' },
  { id: 'moti-nagar', name: 'Moti Nagar', district: 'West Delhi', lat: 28.6600, lon: 77.1450, type: 'Residential', cpcbStationNear: 'Shadipur' },
  { id: 'tagore-garden', name: 'Tagore Garden', district: 'West Delhi', lat: 28.6480, lon: 77.1150, type: 'Residential', cpcbStationNear: 'Punjabi Bagh' },
  { id: 'nangloi', name: 'Nangloi', district: 'West Delhi', lat: 28.6830, lon: 77.0600, type: 'Residential', cpcbStationNear: 'Mundka CAAQMS' },
  { id: 'kirti-nagar', name: 'Kirti Nagar', district: 'West Delhi', lat: 28.6530, lon: 77.1400, type: 'Industrial', cpcbStationNear: 'Shadipur' },
  { id: 'naraina', name: 'Naraina', district: 'West Delhi', lat: 28.6250, lon: 77.1400, type: 'Industrial', cpcbStationNear: 'Pusa' },
  { id: 'mayapuri', name: 'Mayapuri', district: 'West Delhi', lat: 28.6300, lon: 77.1200, type: 'Industrial', cpcbStationNear: 'Punjabi Bagh' },

  // --- South West Delhi ---
  { id: 'dwarka', name: 'Dwarka', district: 'South West Delhi', lat: 28.5921, lon: 77.0460, type: 'Residential', cpcbStationNear: 'Dwarka Sector 8 CAAQMS' },
  { id: 'palam', name: 'Palam', district: 'South West Delhi', lat: 28.5830, lon: 77.0850, type: 'Residential', cpcbStationNear: 'Dwarka' },
  { id: 'najafgarh', name: 'Najafgarh', district: 'South West Delhi', lat: 28.6100, lon: 76.9850, type: 'Residential', cpcbStationNear: 'Najafgarh CAAQMS' },
  { id: 'kapashera', name: 'Kapashera', district: 'South West Delhi', lat: 28.5200, lon: 77.0800, type: 'Industrial', cpcbStationNear: 'IGI Airport' },
  { id: 'mahipalpur', name: 'Mahipalpur', district: 'South West Delhi', lat: 28.5450, lon: 77.1250, type: 'Commercial', cpcbStationNear: 'IGI Airport' },
  { id: 'vasant-vihar', name: 'Vasant Vihar', district: 'South West Delhi', lat: 28.5600, lon: 77.1600, type: 'Diplomatic', cpcbStationNear: 'RK Puram' },
  { id: 'dabri', name: 'Dabri', district: 'South West Delhi', lat: 28.6050, lon: 77.0850, type: 'Residential', cpcbStationNear: 'Dwarka' },
  { id: 'delhi-cantt', name: 'Delhi Cantonment', district: 'South West Delhi', lat: 28.5900, lon: 77.1350, type: 'Residential', cpcbStationNear: 'RK Puram' },
  { id: 'bijwasan', name: 'Bijwasan', district: 'South West Delhi', lat: 28.5250, lon: 77.0550, type: 'Transit', cpcbStationNear: 'Dwarka' },
  { id: 'chhawla', name: 'Chhawla', district: 'South West Delhi', lat: 28.5500, lon: 77.0100, type: 'Residential', cpcbStationNear: 'Najafgarh' },
  { id: 'raj-nagar', name: 'Raj Nagar (Palam)', district: 'South West Delhi', lat: 28.5780, lon: 77.0780, type: 'Residential', cpcbStationNear: 'Dwarka' },
  { id: 'jharoda-kalan', name: 'Jharoda Kalan', district: 'South West Delhi', lat: 28.6500, lon: 76.9400, type: 'Residential', cpcbStationNear: 'Najafgarh' },

  // --- NCR Satellites ---
  { id: 'noida-sec-62', name: 'Sector 62, Noida', district: 'NCR', lat: 28.6245, lon: 77.3649, type: 'Commercial', cpcbStationNear: 'Sector 62 CAAQMS' },
  { id: 'noida-sec-1', name: 'Sector 1, Noida', district: 'NCR', lat: 28.5880, lon: 77.3150, type: 'Industrial', cpcbStationNear: 'Sector 1 CAAQMS' },
  { id: 'noida-sec-125', name: 'Sector 125, Noida', district: 'NCR', lat: 28.5450, lon: 77.3300, type: 'Commercial', cpcbStationNear: 'Sector 125 CAAQMS' },
  { id: 'indirapuram', name: 'Indirapuram', district: 'NCR', lat: 28.6443, lon: 77.3712, type: 'Residential', cpcbStationNear: 'Indirapuram CAAQMS' },
  { id: 'vasundhara', name: 'Vasundhara', district: 'NCR', lat: 28.6603, lon: 77.3573, type: 'Residential', cpcbStationNear: 'Vasundhara CAAQMS' },
  { id: 'ghaziabad-central', name: 'Ghaziabad', district: 'NCR', lat: 28.6692, lon: 77.4538, type: 'Industrial', cpcbStationNear: 'Sanjay Nagar CAAQMS' },
  { id: 'gurugram-sec-51', name: 'Gurugram', district: 'NCR', lat: 28.4595, lon: 77.0266, type: 'Commercial', cpcbStationNear: 'Vikas Sadan CAAQMS' },
  { id: 'faridabad-sec-16', name: 'Faridabad', district: 'NCR', lat: 28.4089, lon: 77.3178, type: 'Industrial', cpcbStationNear: 'Sector 16A CAAQMS' },
];

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface CaaqmsStation {
  id: number;
  name: string;
  shortName: string;
  lat: number;
  lon: number;
  district: string;
  slug: string;
}

/** Comprehensive registry of active Continuous Ambient Air Quality Monitoring Stations (CAAQMS) across Delhi NCR with verified AQICN slugs */
export const DELHI_CAAQMS_STATIONS: CaaqmsStation[] = [
  { id: 2553, name: 'Anand Vihar, Delhi', shortName: 'Anand Vihar', lat: 28.6508, lon: 77.3152, district: 'East Delhi', slug: 'delhi/anand-vihar' },
  { id: 2554, name: 'Mandir Marg, Delhi', shortName: 'Mandir Marg', lat: 28.6341, lon: 77.2005, district: 'Central Delhi', slug: 'delhi/mandir-marg' },
  { id: 2555, name: 'Punjabi Bagh, Delhi', shortName: 'Punjabi Bagh', lat: 28.6683, lon: 77.1167, district: 'West Delhi', slug: 'delhi/punjabi-bagh' },
  { id: 2556, name: 'R.K. Puram, Delhi', shortName: 'R.K. Puram', lat: 28.5648, lon: 77.1744, district: 'South Delhi', slug: 'delhi/r.k.-puram' },
  { id: 10110, name: 'Dr. Karni Singh Shooting Range, Delhi', shortName: 'Dr. Karni Singh Range', lat: 28.4997, lon: 77.2671, district: 'South Delhi', slug: 'delhi/dr.-karni-singh-shooting-range' },
  { id: 10111, name: 'Major Dhyan Chand National Stadium, Delhi', shortName: 'Major Dhyan Chand Stadium', lat: 28.6120, lon: 77.2370, district: 'New Delhi', slug: 'delhi/major-dhyan-chand-national-stadium' },
  { id: 10114, name: 'Delhi Institute of Tool Engineering, Wazirpur, Delhi', shortName: 'Wazirpur', lat: 28.7005, lon: 77.1656, district: 'North West Delhi', slug: 'delhi/wazirpur' },
  { id: 10115, name: 'Satyawati College, Ashok Vihar, Delhi', shortName: 'Satyawati College', lat: 28.6957, lon: 77.1813, district: 'North Delhi', slug: 'delhi/ashok-vihar' },
  { id: 10116, name: 'DITE Okhla Phase 2, Delhi', shortName: 'DITE Okhla', lat: 28.5313, lon: 77.2707, district: 'South East Delhi', slug: 'delhi/okhla-phase-2' },
  { id: 10117, name: 'Shaheed Sukhdev College, Rohini Sector 16, Delhi', shortName: 'Rohini Sector 16', lat: 28.7327, lon: 77.1188, district: 'North West Delhi', slug: 'delhi/rohini' },
  { id: 10118, name: 'Patparganj, Delhi', shortName: 'Patparganj', lat: 28.6237, lon: 77.2872, district: 'East Delhi', slug: 'delhi/patparganj' },
  { id: 10119, name: 'National Institute of Malaria Research, Sector 8, Dwarka, Delhi', shortName: 'Dwarka Sector 8', lat: 28.5769, lon: 77.0759, district: 'South West Delhi', slug: 'delhi/dwarka-sector-8' },
  { id: 10120, name: 'Bramprakash Ayurvedic Hospital, Najafgarh, Delhi', shortName: 'Najafgarh', lat: 28.6090, lon: 76.9855, district: 'South West Delhi', slug: 'delhi/bramphrakash-ayurvedic-hospital--najafgarh' },
  { id: 10121, name: 'Sonia Vihar Water Treatment Plant, Delhi', shortName: 'Sonia Vihar', lat: 28.7101, lon: 77.2462, district: 'North East Delhi', slug: 'delhi/sonia-vihar' },
  { id: 10122, name: 'Lodhi Road, Delhi', shortName: 'Lodhi Road', lat: 28.5910, lon: 77.2230, district: 'New Delhi', slug: 'delhi/lodhi-road' },
  { id: 10124, name: 'Pusa, Delhi', shortName: 'Pusa', lat: 28.6370, lon: 77.1722, district: 'Central Delhi', slug: 'delhi/pusa' },
  { id: 10125, name: 'Burari Crossing, Delhi', shortName: 'Burari Crossing', lat: 28.7250, lon: 77.2000, district: 'North Delhi', slug: 'delhi/burari-crossing' },
  { id: 10126, name: 'Aya Nagar, Delhi', shortName: 'Aya Nagar', lat: 28.4700, lon: 77.1100, district: 'South Delhi', slug: 'delhi/aya-nagar' },
  { id: 10127, name: 'North Campus, Delhi University, Delhi', shortName: 'North Campus DU', lat: 28.6900, lon: 77.2100, district: 'North Delhi', slug: 'delhi/north-campus-delhi-university' },
  { id: 10705, name: 'Jawaharlal Nehru Stadium, Delhi', shortName: 'JLN Stadium', lat: 28.5830, lon: 77.2340, district: 'South Delhi', slug: 'delhi/jawaharlal-nehru-stadium' },
  { id: 10706, name: 'Narela, Delhi', shortName: 'Narela', lat: 28.8206, lon: 77.1011, district: 'North West Delhi', slug: 'delhi/narela' },
  { id: 10708, name: 'Mundka, Delhi', shortName: 'Mundka', lat: 28.6800, lon: 77.0200, district: 'West Delhi', slug: 'delhi/mundka' },
  { id: 11266, name: 'Alipur, Delhi', shortName: 'Alipur', lat: 28.8157, lon: 77.1525, district: 'North Delhi', slug: 'delhi/alipur' },
  { id: 11267, name: 'Pooth Khurd, Bawana, Delhi', shortName: 'Bawana', lat: 28.7758, lon: 77.0463, district: 'North West Delhi', slug: 'delhi/bawana' },
  { id: 11278, name: 'Vasundhara, Ghaziabad', shortName: 'Vasundhara', lat: 28.6603, lon: 77.3573, district: 'NCR', slug: 'india/ghaziabad/vasundhara' },
  { id: 3715, name: 'ITO, Delhi', shortName: 'ITO', lat: 28.6304, lon: 77.2435, district: 'Central Delhi', slug: 'delhi/ito' },
  { id: 8179, name: 'Shadipur, Delhi', shortName: 'Shadipur', lat: 28.6514, lon: 77.1567, district: 'West Delhi', slug: 'delhi/shadipur' },
  { id: 8180, name: 'IHBAS, Dilshad Garden, Delhi', shortName: 'Dilshad Garden', lat: 28.6720, lon: 77.3100, district: 'North East Delhi', slug: 'delhi/ihbas-dilshad-garden' },
  { id: 9291, name: 'Siri Fort, Delhi', shortName: 'Siri Fort', lat: 28.5504, lon: 77.2159, district: 'South Delhi', slug: 'delhi/siri-fort' },
  { id: 10123, name: 'Sector 62, Noida', shortName: 'Noida Sec 62', lat: 28.6245, lon: 77.3649, district: 'NCR', slug: 'india/noida/sector-62' },
  { id: 8182, name: 'Sector 125, Noida', shortName: 'Noida Sec 125', lat: 28.5448, lon: 77.3331, district: 'NCR', slug: 'india/noida/sector-125' },
  { id: 8685, name: 'Vikas Sadan, Gurugram', shortName: 'Gurugram', lat: 28.4595, lon: 77.0266, district: 'NCR', slug: 'india/gurugram/sector-51' },
  { id: 6971, name: 'Sector 16A, Faridabad', shortName: 'Faridabad Sec 16A', lat: 28.4089, lon: 77.3178, district: 'NCR', slug: 'india/faridabad/sector-11' },
];

export function getClosestCpcbStations(lat: number, lon: number): Array<{ station: CaaqmsStation; distanceKm: number }> {
  return DELHI_CAAQMS_STATIONS.map((s) => ({
    station: s,
    distanceKm: haversineKm(lat, lon, s.lat, s.lon),
  })).sort((a, b) => a.distanceKm - b.distanceKm);
}

export function findClosestCpcbStation(lat: number, lon: number): { station: CaaqmsStation; distanceKm: number } {
  const sorted = getClosestCpcbStations(lat, lon);
  return sorted[0];
}

export function searchDelhiLocations(query: string, districtFilter?: string): DelhiLocation[] {
  const q = query.trim().toLowerCase();
  return ALL_DELHI_LOCATIONS.filter((loc) => {
    const matchesDistrict =
      !districtFilter || districtFilter === 'All' || loc.district.toLowerCase() === districtFilter.toLowerCase();
    if (!matchesDistrict) return false;
    if (!q) return true;
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.district.toLowerCase().includes(q) ||
      (loc.cpcbStationNear && loc.cpcbStationNear.toLowerCase().includes(q))
    );
  });
}

export function findNearestDelhiLocation(lat: number, lon: number): { location: DelhiLocation; distanceKm: number } {
  let nearest = ALL_DELHI_LOCATIONS[0];
  let minDistance = Infinity;

  for (const loc of ALL_DELHI_LOCATIONS) {
    const d = haversineKm(lat, lon, loc.lat, loc.lon);
    if (d < minDistance) {
      minDistance = d;
      nearest = loc;
    }
  }

  return { location: nearest, distanceKm: minDistance };
}
