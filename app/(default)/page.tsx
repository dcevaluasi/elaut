import Hero from "@/components/hero";
import Features from "@/components/features";
import FeaturesBlocks from "@/components/features-blocks";
import Newsletter from "@/components/newsletter";
import TrainingTypeSection from "@/components/trainingTypeSection";
import MapIndonesia from "@/components/map";
import FeaturesKepelautan from "@/components/features-kepelatuan";
import FeaturesDiklatKepelautan from "@/components/features-diklat-kepelautan";
import Timeline from "@/components/timeline";
import Testimonials from "@/components/testimonials";
import FeaturesASN from "@/components/features-asn";
import BentoInformationLandingSection from "@/components/elaut/bentoInformationLandingSection";


export default function Home() {
  return (
    <>
      {/* Hero Section  */}
      <Hero />
      <TrainingTypeSection />
      <FeaturesKepelautan />
      <FeaturesDiklatKepelautan />
      {/* <FeaturesASN /> */}
      <FeaturesBlocks />
      <Features />
      {/* <BentoInformationLandingSection /> */}
      {/* <MapIndonesia /> */}
      <Testimonials />
      <Newsletter />
    </>
  );
}
