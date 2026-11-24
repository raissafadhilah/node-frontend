
import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail } from 'lucide-react';

import {
  verifyResetOtp,
  forgotPassword
} from '../../services/api';

import './VerifyResetOtp.css';

function VerifyResetOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);

  function handleOtpChange(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;

    setOtp(newOtp);
    setError('');
    setSuccess('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, event) {
    if (
      event.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event) {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pasted) return;

    const newOtp = Array(6).fill('');

    pasted.split('').forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);
    setError('');
    setSuccess('');

    inputRefs.current[
      Math.min(pasted.length, 6) - 1
    ]?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    const otpValue = otp.join('');

    if (!/^\d{6}$/.test(otpValue)) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyResetOtp(otpValue);

      if (result.success) {
        setSuccess(
          result.message || 'OTP successfully verified.'
        );

        setTimeout(() => {
          navigate('/reset-password');
        }, 700);
      } else {
        setError(
          result.message || 'OTP verification failed.'
        );
      }
    } catch (err) {
      setError(
        err.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email || resending || loading) return;

    setError('');
    setSuccess('');
    setResending(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setSuccess(
          result.message || 'A new verification code has been sent.'
        );
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(
          result.message || 'Unable to resend verification code.'
        );
      }
    } catch (err) {
      setError(
        err.message || 'Unable to resend verification code.'
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="verify-page">

      <section className="verify-container">

        {/* ICON */}
        <div className="verify-icon">
          <Mail size={29} strokeWidth={1.8} />
        </div>

        {/* HEADING */}
        <div className="verify-heading">
          <h1>Check your email</h1>

          <p>
            Input the code that was sent to{' '}
            <span>
              {email || 'your email'}
            </span>
          </p>
        </div>

        {/* FORM */}
        <form
          className="verify-form"
          onSubmit={handleSubmit}
        >

          {/* OTP INPUTS */}
          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={
                  index === 0 ? 'one-time-code' : 'off'
                }
                maxLength={1}
                value={digit}
                onChange={(event) =>
                  handleOtpChange(index, event.target.value)
                }
                onKeyDown={(event) =>
                  handleKeyDown(index, event)
                }
                onPaste={handlePaste}
                aria-label={`Verification digit ${index + 1}`}
                required
              />
            ))}
          </div>

          {/* MESSAGE */}
          {error && (
            <div className="verify-message verify-error">
              {error}
            </div>
          )}

          {success && (
            <div className="verify-message verify-success">
              {success}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="verify-submit"
            disabled={loading || resending}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>

        </form>

        {/* RESEND */}
        <p className="verify-resend">
          Didn't receive the code?

          <button
            type="button"
            onClick={handleResend}
            disabled={!email || resending || loading}
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </p>

        {/* BACK TO LOGIN */}
        <Link to="/login" className="verify-back">
          <span>←</span> Back to log in
        </Link>

      </section>

    </main>
  );
}

export default VerifyResetOtp;
