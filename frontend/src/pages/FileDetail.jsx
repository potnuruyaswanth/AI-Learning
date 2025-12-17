import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { filesAPI, aiAPI } from '../api';
import {
  ArrowLeft,
  FileText,
  Sparkles,
  List,
  HelpCircle,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Lightbulb,
  BookOpen,
  GraduationCap,
  Link as LinkIcon,
  MessageCircle,
  Send,
  RotateCcw,
  Copy,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export default function FileDetail() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Results
  const [summary, setSummary] = useState(null);
  const [bulletPoints, setBulletPoints] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [insights, setInsights] = useState(null);
  const [flashcards, setFlashcards] = useState(null);
  const [glossary, setGlossary] = useState(null);
  const [relatedTopics, setRelatedTopics] = useState(null);
  const [qaHistory, setQaHistory] = useState([]);

  // Loading states
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [bulletPointsLoading, setBulletPointsLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [glossaryLoading, setGlossaryLoading] = useState(false);
  const [relatedTopicsLoading, setRelatedTopicsLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Question state
  const [questionInput, setQuestionInput] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState('summary');

  // File content expanded
  const [showFileContent, setShowFileContent] = useState(false);

  useEffect(() => {
    loadFile();
  }, [id]);

  const loadFile = async () => {
    try {
      const response = await filesAPI.get(id);
      setFile(response.data.file);
    } catch (err) {
      setError(err.message || 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  // AI Handlers
  const handleSummarize = async () => {
    setSummaryLoading(true);
    try {
      const response = await aiAPI.summarize(id);
      setSummary(response.data);
    } catch (err) {
      alert(err.message || 'Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleBulletPoints = async () => {
    setBulletPointsLoading(true);
    try {
      const response = await aiAPI.bulletPoints(id, 10);
      setBulletPoints(response.data);
    } catch (err) {
      alert(err.message || 'Failed to generate bullet points');
    } finally {
      setBulletPointsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    setSelectedAnswers({});
    setShowResults(false);
    try {
      const response = await aiAPI.generateQuiz(id, 5);
      setQuiz(response.data);
    } catch (err) {
      alert(err.message || 'Failed to generate quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleKeyInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await aiAPI.keyInsights(id);
      setInsights(response.data);
    } catch (err) {
      alert(err.message || 'Failed to extract insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleFlashcards = async () => {
    setFlashcardsLoading(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    try {
      const response = await aiAPI.flashcards(id, 10);
      setFlashcards(response.data);
    } catch (err) {
      alert(err.message || 'Failed to generate flashcards');
    } finally {
      setFlashcardsLoading(false);
    }
  };

  const handleGlossary = async () => {
    setGlossaryLoading(true);
    try {
      const response = await aiAPI.glossary(id);
      setGlossary(response.data);
    } catch (err) {
      alert(err.message || 'Failed to extract glossary');
    } finally {
      setGlossaryLoading(false);
    }
  };

  const handleRelatedTopics = async () => {
    setRelatedTopicsLoading(true);
    try {
      const response = await aiAPI.relatedTopics(id);
      setRelatedTopics(response.data);
    } catch (err) {
      alert(err.message || 'Failed to get related topics');
    } finally {
      setRelatedTopicsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!questionInput.trim()) return;
    setQuestionLoading(true);
    try {
      const response = await aiAPI.askQuestion(id, questionInput);
      setQaHistory((prev) => [...prev, response.data]);
      setQuestionInput('');
    } catch (err) {
      alert(err.message || 'Failed to answer question');
    } finally {
      setQuestionLoading(false);
    }
  };

  // Quiz helpers
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const getScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  // Flashcard helpers
  const nextCard = () => {
    if (flashcards && currentCardIndex < flashcards.flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Sparkles, color: 'text-yellow-500' },
    { id: 'bullets', label: 'Key Points', icon: List, color: 'text-green-500' },
    { id: 'insights', label: 'Insights', icon: Lightbulb, color: 'text-amber-500' },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'text-purple-500' },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, color: 'text-indigo-500' },
    { id: 'glossary', label: 'Glossary', icon: BookOpen, color: 'text-teal-500' },
    { id: 'topics', label: 'Related', icon: LinkIcon, color: 'text-cyan-500' },
    { id: 'qa', label: 'Ask AI', icon: MessageCircle, color: 'text-rose-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{file?.originalName}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {formatDate(file?.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-[73px] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? '' : tab.color}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                AI Summary
              </h2>
              <button
                onClick={handleSummarize}
                disabled={summaryLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {summaryLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {summary ? 'Regenerate' : 'Generate Summary'}
              </button>
            </div>
            {summary ? (
              <div className="space-y-4">
                <div className="prose max-w-none bg-gray-50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{summary.summary}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{summary.wordCount} words</span>
                  <button
                    onClick={() => copyToClipboard(summary.summary)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Click "Generate Summary" to create an AI-powered summary of your document.
              </p>
            )}
          </div>
        )}

        {/* Bullet Points Tab */}
        {activeTab === 'bullets' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <List className="h-5 w-5 text-green-500" />
                Key Points
              </h2>
              <button
                onClick={handleBulletPoints}
                disabled={bulletPointsLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {bulletPointsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <List className="h-4 w-4" />
                )}
                {bulletPoints ? 'Regenerate' : 'Extract Key Points'}
              </button>
            </div>
            {bulletPoints ? (
              <ul className="space-y-3">
                {bulletPoints.bulletPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 h-6 w-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </div>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Click "Extract Key Points" to get the main ideas from your document.
              </p>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Key Insights
              </h2>
              <button
                onClick={handleKeyInsights}
                disabled={insightsLoading}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {insightsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="h-4 w-4" />
                )}
                {insights ? 'Regenerate' : 'Extract Insights'}
              </button>
            </div>
            {insights ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h3 className="font-medium text-amber-800 mb-2">Main Theme</h3>
                    <p className="text-gray-700">{insights.mainTheme}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Target Audience</h3>
                    <p className="text-gray-700">{insights.targetAudience}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Key Insights</h3>
                  <div className="space-y-3">
                    {insights.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Click "Extract Insights" to discover deeper insights from your document.
              </p>
            )}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-500" />
                Knowledge Quiz
              </h2>
              <button
                onClick={handleGenerateQuiz}
                disabled={quizLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {quizLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <HelpCircle className="h-4 w-4" />
                )}
                {quiz ? 'New Quiz' : 'Generate Quiz'}
              </button>
            </div>
            {quiz ? (
              <div className="space-y-6">
                {showResults && (
                  <div className={`p-4 rounded-lg ${getScore() >= quiz.questions.length / 2 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Score: {getScore()} / {quiz.questions.length}
                      </span>
                      <span className={`text-sm font-bold ${getScore() >= quiz.questions.length / 2 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.round((getScore() / quiz.questions.length) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
                {quiz.questions.map((q, qIndex) => (
                  <div key={qIndex} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">
                      {qIndex + 1}. {q.question}
                    </h3>
                    <div className="space-y-2">
                      {q.options.map((option, oIndex) => {
                        const isSelected = selectedAnswers[qIndex] === oIndex;
                        const isCorrect = q.correctAnswer === oIndex;
                        let bgColor = 'bg-gray-50 hover:bg-gray-100';
                        if (showResults) {
                          if (isCorrect) bgColor = 'bg-green-100';
                          else if (isSelected && !isCorrect) bgColor = 'bg-red-100';
                        } else if (isSelected) {
                          bgColor = 'bg-blue-100';
                        }
                        return (
                          <button
                            key={oIndex}
                            onClick={() => handleAnswerSelect(qIndex, oIndex)}
                            disabled={showResults}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${bgColor} flex items-center gap-3`}
                          >
                            <span className="flex-shrink-0 h-6 w-6 rounded-full border flex items-center justify-center text-sm">
                              {String.fromCharCode(65 + oIndex)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {showResults && isCorrect && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                            {showResults && isSelected && !isCorrect && (
                              <X className="h-5 w-5 text-red-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {showResults && q.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
                {!showResults && (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Click "Generate Quiz" to test your knowledge of the document.
              </p>
            )}
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-500" />
                Study Flashcards
              </h2>
              <button
                onClick={handleFlashcards}
                disabled={flashcardsLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {flashcardsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Layers className="h-4 w-4" />
                )}
                {flashcards ? 'New Cards' : 'Generate Flashcards'}
              </button>
            </div>
            {flashcards && flashcards.flashcards.length > 0 ? (
              <div className="space-y-4">
                <div className="text-center text-sm text-gray-500 mb-4">
                  Card {currentCardIndex + 1} of {flashcards.flashcards.length}
                </div>
                <div
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="min-h-[250px] p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl cursor-pointer transition-all hover:shadow-md flex flex-col items-center justify-center"
                >
                  <div className="text-xs text-indigo-600 mb-2 uppercase tracking-wide">
                    {flashcards.flashcards[currentCardIndex].category}
                  </div>
                  {showAnswer ? (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-2">Answer</div>
                      <p className="text-lg text-gray-800">{flashcards.flashcards[currentCardIndex].back}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-2">Question</div>
                      <p className="text-lg font-medium text-gray-900">{flashcards.flashcards[currentCardIndex].front}</p>
                      <p className="text-sm text-gray-400 mt-4">Click to reveal answer</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevCard}
                    disabled={currentCardIndex === 0}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      setShowAnswer(false);
                      setCurrentCardIndex(0);
                    }}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    onClick={nextCard}
                    disabled={currentCardIndex === flashcards.flashcards.length - 1}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Click "Generate Flashcards" to create study cards from your document.
              </p>
            )}
          </div>
        )}

        {/* Glossary Tab */}
        {activeTab === 'glossary' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-teal-500" />
                Key Terms & Glossary
              </h2>
              <button
                onClick={handleGlossary}
                disabled={glossaryLoading}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {glossaryLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BookOpen className="h-4 w-4" />
                )}
                {glossary ? 'Regenerate' : 'Extract Glossary'}
              </button>
            </div>
            {glossary ? (
              <div className="space-y-4">
                {glossary.terms.map((term, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{term.term}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        term.importance === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : term.importance === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {term.importance}
                      </span>
                    </div>
                    <p className="text-gray-600">{term.definition}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Click "Extract Glossary" to identify key terms and their definitions.
              </p>
            )}
          </div>
        )}

        {/* Related Topics Tab */}
        {activeTab === 'topics' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-cyan-500" />
                Related Topics
              </h2>
              <button
                onClick={handleRelatedTopics}
                disabled={relatedTopicsLoading}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {relatedTopicsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                {relatedTopics ? 'Refresh' : 'Find Related Topics'}
              </button>
            </div>
            {relatedTopics ? (
              <div className="space-y-6">
                {relatedTopics.prerequisites && relatedTopics.prerequisites.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-orange-500" />
                      Prerequisites (Learn First)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {relatedTopics.prerequisites.map((topic, i) => (
                        <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Related Topics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedTopics.topics.map((topic, i) => (
                      <div key={i} className="p-4 border rounded-lg hover:bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-1">{topic.topic}</h4>
                        <p className="text-sm text-gray-600 mb-2">{topic.relevance}</p>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(topic.searchQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Search: {topic.searchQuery}
                          <LinkIcon className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {relatedTopics.advancedTopics && relatedTopics.advancedTopics.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Advanced Topics (Learn Next)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {relatedTopics.advancedTopics.map((topic, i) => (
                        <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Click "Find Related Topics" to discover topics to learn before and after this content.
              </p>
            )}
          </div>
        )}

        {/* Q&A Tab */}
        {activeTab === 'qa' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-rose-500" />
              Ask AI About This Document
            </h2>
            
            {/* Question Input */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                placeholder="Ask any question about this document..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                disabled={questionLoading}
              />
              <button
                onClick={handleAskQuestion}
                disabled={questionLoading || !questionInput.trim()}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {questionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Ask
              </button>
            </div>

            {/* Q&A History */}
            {qaHistory.length > 0 ? (
              <div className="space-y-4">
                {qaHistory.map((qa, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Your Question</div>
                        <p className="font-medium">{qa.question}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 ml-11">
                      <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-rose-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500">AI Answer</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            qa.confidence === 'high'
                              ? 'bg-green-100 text-green-700'
                              : qa.confidence === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {qa.confidence} confidence
                          </span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{qa.answer}</p>
                        {qa.relevantQuotes && qa.relevantQuotes.length > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-2">Supporting Quotes:</div>
                            {qa.relevantQuotes.map((quote, qi) => (
                              <p key={qi} className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3 mb-2">
                                "{quote}"
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Ask any question about the content of your document and get AI-powered answers.
              </p>
            )}
          </div>
        )}

        {/* File Preview */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <button
            onClick={() => setShowFileContent(!showFileContent)}
            className="w-full flex items-center justify-between text-lg font-semibold"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              Original Document
            </span>
            {showFileContent ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {showFileContent && file?.content && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {file.content}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
