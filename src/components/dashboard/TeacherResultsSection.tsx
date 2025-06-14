
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { Exam } from '../../types/exam';

const TeacherResultsSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const myExams = exams.filter(exam => exam.createdBy === user?.id);

  useEffect(() => {
    if (user) {
      loadExams();
    }
  }, [user]);

  const loadExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('teacher_id', user?.id);

      if (error) throw error;

      const transformedExams: Exam[] = data?.map(exam => ({
        id: exam.id,
        title: exam.title,
        description: exam.description || '',
        subject: exam.subject_id || 'Unknown',
        questions: [],
        duration: exam.duration_minutes,
        startTime: exam.start_time ? new Date(exam.start_time) : new Date(),
        endTime: exam.end_time ? new Date(exam.end_time) : new Date(),
        totalPoints: exam.total_points || exam.total_marks,
        isActive: exam.is_published,
        allowReview: true,
        shuffleQuestions: false,
        createdBy: exam.teacher_id,
        alwaysAvailable: !exam.start_time
      })) || [];

      setExams(transformedExams);
    } catch (error) {
      console.error('Error loading exams:', error);
      toast({
        title: "Error",
        description: "Failed to load exams",
        variant: "destructive",
      });
    }
  };

  const loadResults = async (examId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          *,
          student:profiles!inner(name, email)
        `)
        .eq('exam_id', examId);

      if (error) throw error;

      setResults(data || []);
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: "Error",
        description: "Failed to load exam results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExamSelect = (examId: string) => {
    setSelectedExam(examId);
    loadResults(examId);
  };

  if (myExams.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No exams found. Create your first exam to see results here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exam Results Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myExams.map((exam) => (
              <Card 
                key={exam.id} 
                className={`cursor-pointer transition-all ${
                  selectedExam === exam.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
                onClick={() => handleExamSelect(exam.id)}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{exam.title}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Subject: {exam.subject}</p>
                    <p>Points: {exam.totalPoints}</p>
                    <p>Duration: {exam.duration} minutes</p>
                    <Badge variant={exam.isActive ? "default" : "secondary"}>
                      {exam.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedExam && (
        <Card>
          <CardHeader>
            <CardTitle>
              Results for: {myExams.find(e => e.id === selectedExam)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading results...</p>
            ) : results.length === 0 ? (
              <p className="text-gray-500">No submissions yet for this exam.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-2 text-left">Student</th>
                      <th className="border border-gray-200 p-2 text-left">Email</th>
                      <th className="border border-gray-200 p-2 text-left">Score</th>
                      <th className="border border-gray-200 p-2 text-left">Submitted</th>
                      <th className="border border-gray-200 p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id}>
                        <td className="border border-gray-200 p-2">{result.student?.name}</td>
                        <td className="border border-gray-200 p-2">{result.student?.email}</td>
                        <td className="border border-gray-200 p-2">
                          {result.score || 0}/{myExams.find(e => e.id === selectedExam)?.totalPoints}
                        </td>
                        <td className="border border-gray-200 p-2">
                          {result.completed_at ? new Date(result.completed_at).toLocaleDateString() : 'In Progress'}
                        </td>
                        <td className="border border-gray-200 p-2">
                          <Badge variant={result.is_completed ? "default" : "secondary"}>
                            {result.is_completed ? "Completed" : "In Progress"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherResultsSection;
