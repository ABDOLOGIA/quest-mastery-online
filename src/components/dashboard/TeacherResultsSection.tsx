
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { Exam } from '../../types/exam';
import { Download, FileText, Users } from 'lucide-react';

interface ExamResult {
  id: string;
  student_id: string;
  score: number;
  completed_at: string;
  is_completed: boolean;
  student: {
    name: string;
    email: string;
  } | null;
}

const TeacherResultsSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadExams();
    }
  }, [user]);

  const loadExams = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading exams:', error);
        toast({
          title: "Error",
          description: "Failed to load exams",
          variant: "destructive",
        });
        return;
      }

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
          student:profiles(name, email)
        `)
        .eq('exam_id', examId);

      if (error) {
        console.error('Error loading results:', error);
        toast({
          title: "Error",
          description: "Failed to load exam results",
          variant: "destructive",
        });
        return;
      }

      // Transform the data to match our interface
      const transformedResults: ExamResult[] = (data || []).map(result => ({
        id: result.id,
        student_id: result.student_id,
        score: result.score || 0,
        completed_at: result.completed_at,
        is_completed: result.is_completed,
        student: Array.isArray(result.student) && result.student.length > 0 
          ? {
              name: result.student[0].name || 'Unknown',
              email: result.student[0].email || 'Unknown'
            }
          : result.student && typeof result.student === 'object' && 'name' in result.student
          ? {
              name: result.student.name || 'Unknown',
              email: result.student.email || 'Unknown'
            }
          : {
              name: 'Unknown',
              email: 'Unknown'
            }
      }));

      setResults(transformedResults);
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

  const exportResults = () => {
    if (!selectedExam || results.length === 0) return;

    const exam = exams.find(e => e.id === selectedExam);
    const csvContent = [
      ['Student Name', 'Email', 'Score', 'Total Points', 'Percentage', 'Status', 'Completed At'],
      ...results.map(result => [
        result.student?.name || 'Unknown',
        result.student?.email || 'Unknown',
        result.score || 0,
        exam?.totalPoints || 0,
        exam?.totalPoints ? Math.round(((result.score || 0) / exam.totalPoints) * 100) : 0,
        result.is_completed ? 'Completed' : 'In Progress',
        result.completed_at ? new Date(result.completed_at).toLocaleDateString() : 'Not completed'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam?.title || 'exam'}_results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (exams.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No exams found</p>
          <p className="text-sm text-gray-400">Create your first exam to see results here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Exam Results Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
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
                      {exam.isActive ? "Published" : "Draft"}
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
            <div className="flex justify-between items-center">
              <CardTitle>
                Results for: {exams.find(e => e.id === selectedExam)?.title}
              </CardTitle>
              {results.length > 0 && (
                <Button onClick={exportResults} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading results...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No submissions yet for this exam.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Total submissions: {results.length}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-3 text-left font-medium">Student</th>
                        <th className="border border-gray-200 p-3 text-left font-medium">Email</th>
                        <th className="border border-gray-200 p-3 text-left font-medium">Score</th>
                        <th className="border border-gray-200 p-3 text-left font-medium">Percentage</th>
                        <th className="border border-gray-200 p-3 text-left font-medium">Submitted</th>
                        <th className="border border-gray-200 p-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result) => {
                        const exam = exams.find(e => e.id === selectedExam);
                        const percentage = exam?.totalPoints ? Math.round(((result.score || 0) / exam.totalPoints) * 100) : 0;
                        
                        return (
                          <tr key={result.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 p-3">{result.student?.name || 'Unknown'}</td>
                            <td className="border border-gray-200 p-3">{result.student?.email || 'Unknown'}</td>
                            <td className="border border-gray-200 p-3 font-medium">
                              {result.score || 0}/{exam?.totalPoints || 0}
                            </td>
                            <td className="border border-gray-200 p-3">
                              <span className={`px-2 py-1 rounded text-sm ${
                                percentage >= 70 ? 'bg-green-100 text-green-800' :
                                percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {percentage}%
                              </span>
                            </td>
                            <td className="border border-gray-200 p-3">
                              {result.completed_at ? new Date(result.completed_at).toLocaleString() : 'In Progress'}
                            </td>
                            <td className="border border-gray-200 p-3">
                              <Badge variant={result.is_completed ? "default" : "secondary"}>
                                {result.is_completed ? "Completed" : "In Progress"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherResultsSection;
