'use client';

import HeroSlider from '../components/home/HeroSlider';
import HotDealsCarousel from '../components/home/HotDealsCarousel';
import CategoryGrid from '../components/home/CategoryGrid';
import ComparisonWidget from '../components/home/ComparisonWidget';
import BoilerCalculator from '../components/BoilerCalculator';
import FittingMatcher from '../components/FittingMatcher';
import VideoGallery from '../components/home/VideoGallery';
import ShowroomLocator from '../components/home/ShowroomLocator';

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      <HeroSlider />
      <HotDealsCarousel />
      <CategoryGrid />
      <ComparisonWidget />
      <BoilerCalculator />
      <FittingMatcher />
      <VideoGallery />
      <ShowroomLocator />
    </div>
  );
}
