/* 
 * مكون VerifyEmail الخاص بواجهة المستخدم.
 */
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.message || 'Account activated successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || (typeof err === 'string' ? err : 'Verification failed. The link may be expired.'));
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-white dark:bg-slate-950 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-blue-500/10 dark:shadow-lime-500/5 p-8 text-center border border-slate-100 dark:border-slate-800"
      >
        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center"
            >
              <Loader2 className="h-16 w-16 text-blue-600 dark:text-lime-500 animate-spin mb-6" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verifying Account</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Please wait while we activate your account...</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center"
            >
              <div className="h-20 w-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome Aboard!</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8">{message}</p>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full rounded-full !bg-blue-600 dark:!bg-lime-500 text-white dark:text-slate-900 font-bold py-4 shadow-xl shadow-blue-600/20 dark:shadow-lime-500/20 group"
              >
                <span>Go to Login</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center"
            >
              <div className="h-20 w-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verification Failed</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8">{message}</p>
              <Button 
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full rounded-full border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4"
              >
                Return to Login
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
