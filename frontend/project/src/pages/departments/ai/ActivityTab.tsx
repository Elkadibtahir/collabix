import { Cpu, FlaskConical, Rocket, Brain, FileText, Users } from 'lucide-react';
import { DeptActivity } from '../common/DeptActivity';

export function AIActivityTab() {
  return (
    <DeptActivity items={[
      { id: 'a1', icon: <Cpu />, tone: 'accent', title: 'Chatbot v2 training completed with 92% accuracy', timestamp: '1h ago' },
      { id: 'a2', icon: <FlaskConical />, tone: 'info', title: 'New experiment started: Recommendation System v3', timestamp: '3h ago' },
      { id: 'a3', icon: <Rocket />, tone: 'success', title: 'Document classification model deployed to production', timestamp: '5h ago' },
      { id: 'a4', icon: <Brain />, tone: 'accent', title: 'Research paper "LLM Fine-tuning" submitted for review', timestamp: '1d ago' },
      { id: 'a5', icon: <FileText />, tone: 'neutral', title: 'Monthly experiment report generated', timestamp: '2d ago' },
      { id: 'a6', icon: <Users />, tone: 'info', title: 'New data scientist "Kevin Park" joined Data Science team', timestamp: '3d ago' },
    ]} />
  );
}
