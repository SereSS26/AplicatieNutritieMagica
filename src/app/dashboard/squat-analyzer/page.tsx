import SquatAnalyzer from '@/src/components/SquatAnalyzer';

export const metadata = {
  title: 'Squat Form Analyzer | Aplicatie Nutritie Magica',
  description: 'Analyze your squat form with AI pose detection and compare against perfect form reference',
};

export default function SquatAnalyzerPage() {
  return <SquatAnalyzer referenceVideoPath="/genuflexiuni_corecte.mp4" />;
}
