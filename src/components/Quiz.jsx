/**
 * Quiz.jsx
 * Interactive multiple-choice quiz generated from the uploaded PDF.
 * Features immediate per-question colour feedback and an animated score summary.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Radio,
  RadioGroup, FormControlLabel, FormControl, Alert,
  LinearProgress, Chip, alpha, useTheme, CircularProgress,
} from '@mui/material';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import CancelIcon         from '@mui/icons-material/Cancel';
import QuizIcon           from '@mui/icons-material/Quiz';
import ReplayIcon         from '@mui/icons-material/Replay';
import AutorenewIcon      from '@mui/icons-material/Autorenew';
import EmojiEventsIcon    from '@mui/icons-material/EmojiEvents';
import { generateQuiz }   from '../services/gemini';
import { useAppContext }  from '../context/AppContext';
import EmptyState         from './EmptyState';

// ---------------------------------------------------------------------------
// Score Card
// ---------------------------------------------------------------------------
function ScoreCard({ score, total, onRetry, onRegenerate }) {
  const theme    = useTheme();
  const pct      = Math.round((score / total) * 100);
  const isPassed = pct >= 60;
  const color    = isPassed ? theme.palette.success.main : theme.palette.error.main;

  const getMessage = () => {
    if (pct === 100) return 'Perfect score! Outstanding! 🎉';
    if (pct >= 80)  return 'Great job! You know this well. 🌟';
    if (pct >= 60)  return 'Good effort! Keep studying. 📚';
    return 'Keep practising — you\'ll get there! 💪';
  };

  return (
    <Box className="fade-in-up" sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center', py: 4 }}>
      {/* Trophy icon */}
      <Box
        sx={{
          width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
          background: `linear-gradient(135deg, ${alpha(color, 0.2)}, ${alpha(color, 0.05)})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${alpha(color, 0.3)}`,
        }}
      >
        <EmojiEventsIcon sx={{ fontSize: 40, color }} />
      </Box>

      <Typography variant="h4" fontWeight={800} gutterBottom>Quiz Complete!</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {getMessage()}
      </Typography>

      {/* Score ring */}
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
        <CircularProgress
          variant="determinate"
          value={pct}
          size={140}
          thickness={5}
          sx={{
            color,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
              transition: 'stroke-dashoffset 1.2s ease',
            },
          }}
        />
        {/* Background track */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={140}
          thickness={5}
          sx={{
            color: alpha(color, 0.1),
            position: 'absolute',
            left: 0,
          }}
        />
        <Box
          sx={{
            top: 0, left: 0, bottom: 0, right: 0,
            position: 'absolute',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Typography variant="h4" fontWeight={800} sx={{ color }}>
            {pct}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {score}/{total} correct
          </Typography>
        </Box>
      </Box>

      {/* Stats row */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
        <Box sx={{ textAlign: 'center', px: 3, py: 1.5, borderRadius: 3,
          bgcolor: alpha(theme.palette.success.main, 0.08),
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
          <Typography variant="h5" fontWeight={700} color="success.main">{score}</Typography>
          <Typography variant="caption" color="text.secondary">Correct</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', px: 3, py: 1.5, borderRadius: 3,
          bgcolor: alpha(theme.palette.error.main, 0.08),
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
          <Typography variant="h5" fontWeight={700} color="error.main">{total - score}</Typography>
          <Typography variant="caption" color="text.secondary">Incorrect</Typography>
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<ReplayIcon />} onClick={onRetry}>
          Retry Quiz
        </Button>
        <Button variant="outlined" startIcon={<AutorenewIcon />} onClick={onRegenerate}>
          New Questions
        </Button>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Question card
// ---------------------------------------------------------------------------
function QuestionCard({ question, qIndex, total, onAnswer }) {
  const theme       = useTheme();
  const [selected,  setSelected]  = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selected === question.correctAnswer;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    onAnswer(selected === question.correctAnswer);
  };

  const getOptionStyle = (opt) => {
    if (!submitted) return {};
    if (opt === question.correctAnswer) {
      return {
        bgcolor: alpha(theme.palette.success.main, 0.1),
        border: `1.5px solid ${theme.palette.success.main}`,
        borderRadius: 2,
      };
    }
    if (opt === selected && opt !== question.correctAnswer) {
      return {
        bgcolor: alpha(theme.palette.error.main, 0.08),
        border: `1.5px solid ${theme.palette.error.main}`,
        borderRadius: 2,
      };
    }
    return {};
  };

  return (
    <Box className="fade-in-up">
      {/* Progress */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography variant="caption" color="text.secondary">
            Question {qIndex + 1} of {total}
          </Typography>
          <Chip
            label={`${Math.round(((qIndex + 1) / total) * 100)}%`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ height: 20, fontSize: 10 }}
          />
        </Box>
        <LinearProgress variant="determinate" value={((qIndex + 1) / total) * 100} />
      </Box>

      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 4 }}>
        {/* Question header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #059669 0%, #D97706 100%)',
            p: 3, borderRadius: '16px 16px 0 0',
          }}
        >
          <Typography variant="caption" fontWeight={700}
            sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Question {qIndex + 1}
          </Typography>
          <Typography variant="h6" fontWeight={600} sx={{ color: '#fff', mt: 0.75, lineHeight: 1.5 }}>
            {question.question}
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Result banner */}
          {submitted && (
            <Alert
              severity={isCorrect ? 'success' : 'error'}
              icon={isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              {isCorrect
                ? 'Correct! Well done.'
                : `Incorrect. The correct answer is: "${question.correctAnswer}"`}
            </Alert>
          )}

          {/* Options */}
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={selected}
              onChange={(e) => !submitted && setSelected(e.target.value)}
            >
              {question.options.map((opt, i) => (
                <FormControlLabel
                  key={i}
                  value={opt}
                  disabled={submitted}
                  control={
                    <Radio
                      color={
                        submitted
                          ? opt === question.correctAnswer
                            ? 'success'
                            : opt === selected
                              ? 'error'
                              : 'default'
                          : 'primary'
                      }
                      size="small"
                    />
                  }
                  label={opt}
                  sx={{
                    mb: 1, mx: 0, px: 1.5, py: 0.75,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    transition: 'all 0.2s ease',
                    ...getOptionStyle(opt),
                    '&:hover': !submitted ? {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderColor: theme.palette.primary.main,
                    } : {},
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            {!submitted ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!selected}
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={qIndex < total - 1 ? undefined : undefined}
              >
                {qIndex < total - 1 ? 'Next Question →' : 'See Results'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Quiz() {
  const theme = useTheme();
  const {
    quiz, setQuiz, extractedText,
    loading, setLoadingKey, error, setErrorKey,
  } = useAppContext();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers,      setAnswers]      = useState([]); // [true|false]
  const [quizDone,     setQuizDone]     = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!extractedText) return;
    setErrorKey('quiz', '');
    setLoadingKey('quiz', true);
    setCurrentIndex(0);
    setAnswers([]);
    setQuizDone(false);
    try {
      const questions = await generateQuiz(extractedText);
      setQuiz(questions);
    } catch (err) {
      setErrorKey('quiz', err.message);
    } finally {
      setLoadingKey('quiz', false);
    }
  }, [extractedText, setQuiz, setLoadingKey, setErrorKey]);

  // Auto-generate if text exists but no quiz yet
  useEffect(() => {
    if (extractedText && quiz.length === 0 && !loading.quiz) {
      handleGenerate();
    }
  }, [extractedText]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = (isCorrect) => {
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    if (currentIndex + 1 >= quiz.length) {
      setQuizDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setQuizDone(false);
  };

  // ── Empty state
  if (!extractedText) {
    return (
      <EmptyState
        icon={<QuizIcon />}
        title="No Document Uploaded"
        description="Upload a PDF first to generate a quiz."
      />
    );
  }

  // ── Loading state
  if (loading.quiz) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={56} sx={{ mb: 3 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>Generating Quiz…</Typography>
        <Typography variant="body2" color="text.secondary">
          AI is crafting challenging questions from your document
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="fade-in-up">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={700}>Interactive Quiz</Typography>
          <Typography variant="body2" color="text.secondary">
            Test your understanding of the uploaded material
          </Typography>
        </Box>
        {!quizDone && quiz.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<AutorenewIcon />}
            onClick={handleGenerate}
            size="small"
          >
            New Quiz
          </Button>
        )}
      </Box>

      {/* Error */}
      {error.quiz && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setErrorKey('quiz', '')}>
          {error.quiz}
        </Alert>
      )}

      {/* Content */}
      {quizDone ? (
        <ScoreCard
          score={answers.filter(Boolean).length}
          total={quiz.length}
          onRetry={handleRetry}
          onRegenerate={handleGenerate}
        />
      ) : quiz.length > 0 ? (
        <QuestionCard
          key={currentIndex}
          question={quiz[currentIndex]}
          qIndex={currentIndex}
          total={quiz.length}
          onAnswer={handleAnswer}
        />
      ) : null}
    </Box>
  );
}
