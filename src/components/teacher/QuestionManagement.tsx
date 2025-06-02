
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download,
  Search
} from 'lucide-react';

interface Question {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'fill-blank' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const QuestionManagement: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'single-choice',
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      points: 10,
      category: 'Mathematics',
      difficulty: 'easy'
    },
    {
      id: '2',
      type: 'multiple-choice',
      question: 'Which are prime numbers?',
      options: ['2', '3', '4', '5'],
      correctAnswer: ['2', '3', '5'],
      points: 15,
      category: 'Mathematics',
      difficulty: 'medium'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: 'single-choice',
    category: 'Mathematics',
    difficulty: 'medium',
    points: 10
  });

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || q.category === filterCategory;
    const matchesType = filterType === 'all' || q.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleAddQuestion = () => {
    if (newQuestion.question && newQuestion.type) {
      const question: Question = {
        id: Date.now().toString(),
        question: newQuestion.question,
        type: newQuestion.type as Question['type'],
        category: newQuestion.category || 'General',
        difficulty: newQuestion.difficulty || 'medium',
        points: newQuestion.points || 10,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer
      };
      setQuestions([...questions, question]);
      setNewQuestion({
        type: 'single-choice',
        category: 'Mathematics',
        difficulty: 'medium',
        points: 10
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Question Management</h2>
        <div className="space-x-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chinese HSK2">Chinese HSK2</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="single-choice">Single Choice</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="fill-blank">Fill in Blank</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 flex items-center">
              Total: {filteredQuestions.length} questions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Question Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={newQuestion.type} onValueChange={(value: Question['type']) => setNewQuestion({...newQuestion, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Question Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-choice">Single Choice</SelectItem>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="fill-blank">Fill in Blank</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Category"
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
              />
              <Input
                type="number"
                placeholder="Points"
                value={newQuestion.points}
                onChange={(e) => setNewQuestion({...newQuestion, points: parseInt(e.target.value)})}
              />
            </div>
            <Textarea
              placeholder="Enter your question..."
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddQuestion}>
                Add Question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{question.type}</Badge>
                    <Badge variant="secondary">{question.category}</Badge>
                    <Badge variant={question.difficulty === 'easy' ? 'default' : question.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                      {question.difficulty}
                    </Badge>
                    <span className="text-sm text-gray-600">{question.points} points</span>
                  </div>
                  <p className="text-lg font-medium mb-2">{question.question}</p>
                  {question.options && (
                    <div className="space-y-1">
                      {question.options.map((option, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {String.fromCharCode(65 + index)}. {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteQuestion(question.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuestionManagement;
