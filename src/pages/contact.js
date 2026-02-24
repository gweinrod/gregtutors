import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Modal from "../components/Modal";
import { updateContext } from "../lib/auth";
import { getRecaptchaSiteKey, executeRecaptcha, checkActionAllowed } from "../lib/recaptcha";

// Same visual style as schedule page: cream, gold border, Nunito, rounded
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

.cp-root {
  --cream: #f5f0e8;
  --cream-dark: #ede7d8;
  --ink: #1a1612;
  --ink-muted: #6b6258;
  --main-blue: #000080;
  --gold: #ffd700;
  --border: #ddd5c5;
  font-family: 'Nunito', sans-serif;
  background: var(--cream);
  color: var(--ink);
  min-height: 60vh;
  margin: 1rem;
  border: 3px solid var(--gold);
  border-radius: 8px;
  overflow: hidden;
}

.cp-header {
  background: var(--cream);
  border-bottom: 1.5px solid var(--border);
  padding: 0 32px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cp-brand {
  font-family: 'Nunito', sans-serif;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.cp-body {
  padding: 32px;
  max-width: 640px;
}

.cp-form-group { margin-bottom: 20px; }
.cp-label {
  display: block; font-size: 14px; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink-muted); margin-bottom: 6px;
}
.cp-label .required { color: #c0392b; }
.cp-input, .cp-textarea, .cp-select {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid var(--border); border-radius: 8px;
  background: #fff; font-family: 'Nunito', sans-serif;
  font-size: 16px; color: var(--ink); outline: none;
  transition: border-color 0.18s; box-sizing: border-box;
}
.cp-textarea { min-height: 120px; resize: vertical; }
.cp-input:focus, .cp-textarea:focus, .cp-select:focus { border-color: var(--ink-muted); }
.cp-radio-group { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; }
.cp-radio-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 16px; font-weight: 500; cursor: pointer;
}
.cp-radio-label input { width: 18px; height: 18px; accent-color: var(--main-blue); }
.cp-actions { display: flex; gap: 12px; margin-top: 28px; flex-wrap: wrap; }
.cp-btn {
  padding: 10px 24px; border-radius: 20px;
  font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 500;
  cursor: pointer; transition: opacity 0.15s; border: none;
}
.cp-btn-submit {
  background: var(--main-blue); color: var(--cream);
}
.cp-btn-submit:hover:not(:disabled) { opacity: 0.9; }
.cp-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.cp-btn-clear {
  background: none; border: 1.5px solid var(--border); color: var(--ink-muted);
}
.cp-btn-clear:hover { background: var(--cream-dark); }
.cp-message { margin-top: 16px; padding: 12px; border-radius: 8px; font-size: 15px; }
.cp-message.success { background: #e8f5e9; color: #2e7d32; }
.cp-message.error { background: #ffebee; color: #c62828; }
.cp-subtitle { font-size: 15px; color: var(--ink-muted); margin-bottom: 24px; }

/* Success modal */
.cp-success-overlay {
  position: fixed; inset: 0; background: rgba(26,22,18,0.45);
  z-index: 200; display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(2px);
}
.cp-success-modal {
  background: #f5f0e8; opacity: 1;
  border: 3px solid #ffd700; border-radius: 16px;
  width: 360px; max-width: 90vw; padding: 32px;
  box-shadow: 0 24px 64px rgba(26,22,18,0.18);
  animation: cp-modal-in 0.22s ease;
}
@keyframes cp-modal-in {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
.cp-success-title {
  font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 20px;
  margin-bottom: 24px; text-align: center; color: var(--ink);
}
.cp-success-close {
  display: block; width: 100%;
  background: #000080; color: #f5f0e8;
  border: 2px solid #000080; padding: 10px 24px; border-radius: 20px;
  font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 500;
  cursor: pointer; transition: opacity 0.15s;
  -webkit-appearance: none; appearance: none;
}
.cp-success-close:hover { opacity: 0.9; }
`;

const ABOUT_OPTIONS = [
  { value: "registration", label: "Registration" },
  { value: "scheduling", label: "Scheduling" },
  { value: "employment", label: "Employment" },
  { value: "other", label: "Other" },
];

const REACH_OPTIONS = [
  { value: "phone", label: "Phone" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
];

export default function ContactPage() {
  const router = useRouter();
  const { user, logout, context, loginWithProvider, signInWithGoogleIdToken } = updateContext();

  const [loginModal, setLoginModal] = useState(null);
  const [email, setEmail] = useState("");
  const [myName, setMyName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [about, setAbout] = useState("");
  const [aboutOther, setAboutOther] = useState("");
  const [location, setLocation] = useState("");
  const [bestReachedBy, setBestReachedBy] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [contactAllowed, setContactAllowed] = useState(null);

  const handleLogout = async () => {
    const { allowed } = await checkActionAllowed("logout");
    if (allowed) logout();
  };

  const openLoginModal = async () => {
    const { allowed } = await checkActionAllowed("login");
    if (allowed) setLoginModal("login");
  };

  useEffect(() => {
    if (user && loginModal === "login") setLoginModal(null);
  }, [user, loginModal]);

  useEffect(() => {
    let cancelled = false;
    checkActionAllowed("contact").then(({ allowed }) => {
      if (!cancelled) setContactAllowed(allowed);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (contactAllowed === false && typeof window !== "undefined") {
      router.push("/");
    }
  }, [contactAllowed, router]);

  useEffect(() => {
    let tag = document.getElementById("cp-styles");
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "cp-styles";
      document.head.appendChild(tag);
    }
    tag.textContent = CSS;
  }, []);

  const clearForm = () => {
    setEmail("");
    setMyName("");
    setStudentName("");
    setAbout("");
    setAboutOther("");
    setLocation("");
    setBestReachedBy("");
    setContactInfo("");
    setMessage("");
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      const siteKey = getRecaptchaSiteKey();
      const recaptchaToken = siteKey ? await executeRecaptcha(siteKey, "contact") : "";
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          myName,
          studentName,
          about: about === "other" ? `Other: ${aboutOther}` : about,
          recaptchaToken,
          location,
          bestReachedBy,
          contactInfo,
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        clearForm();
        setShowSuccessModal(true);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <Head>
        <title>Contact | {context.siteTitle}</title>
        <meta name="description" content="Contact form for tutoring questions" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <Header user={user} openModal={openLoginModal} logout={handleLogout} page="contact" theme={context.theme} />
      <main className="content" style={{ padding: 0 }}>
        <div className="cp-root">
          <header className="cp-header">
            <div className="cp-brand">Contact</div>
          </header>
          <div className="cp-body">
            <p className="cp-subtitle">
              Contact form for all of your tutoring questions
            </p>
            <form onSubmit={handleSubmit}>
              <div className="cp-form-group">
                <label className="cp-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  className="cp-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                />
              </div>

              <div className="cp-form-group">
                <label className="cp-label">
                  My name is... <span className="required">*</span>
                </label>
                <input
                  className="cp-input"
                  type="text"
                  required
                  value={myName}
                  onChange={(e) => setMyName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="cp-form-group">
                <label className="cp-label">
                  and the [current/prospective] student&apos;s name is...
                </label>
                <input
                  className="cp-input"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Student's name"
                />
              </div>

              <div className="cp-form-group">
                <label className="cp-label">
                  This is about... <span className="required">*</span>
                </label>
                <div className="cp-radio-group">
                  {ABOUT_OPTIONS.map((opt, i) => (
                    <label key={opt.value} className="cp-radio-label">
                      <input
                        type="radio"
                        name="about"
                        value={opt.value}
                        checked={about === opt.value}
                        onChange={() => setAbout(opt.value)}
                        required={i === 0}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {about === "other" && (
                  <input
                    className="cp-input"
                    type="text"
                    placeholder="Other:"
                    value={aboutOther}
                    onChange={(e) => setAboutOther(e.target.value)}
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>

              <div className="cp-form-group">
                <label className="cp-label">
                  My location is around or near...
                </label>
                <input
                  className="cp-input"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Your location"
                />
              </div>

              <div className="cp-form-group">
                <label className="cp-label">
                  I am best reached by... <span className="required">*</span>
                </label>
                <div className="cp-radio-group">
                  {REACH_OPTIONS.map((opt) => (
                    <label key={opt.value} className="cp-radio-label">
                      <input
                        type="radio"
                        name="reach"
                        value={opt.value}
                        checked={bestReachedBy === opt.value}
                        onChange={() => setBestReachedBy(opt.value)}
                        required
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="cp-form-group">
                <label className="cp-label">
                  and that number or e-mail address is... <span className="required">*</span>
                </label>
                <input
                  className="cp-input"
                  type="text"
                  required
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Phone number or email"
                />
              </div>

              <div className="cp-form-group">
                <label className="cp-label">
                  I would like to know... <span className="required">*</span>
                </label>
                <textarea
                  className="cp-textarea"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message"
                />
              </div>

              <div className="cp-actions">
                <button type="submit" className="cp-btn cp-btn-submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit"}
                </button>
                <button type="button" className="cp-btn cp-btn-clear" onClick={clearForm}>
                  Clear form
                </button>
              </div>

              {status === "error" && (
                <p className="cp-message error">Something went wrong. Please try again or contact us directly.</p>
              )}
            </form>
          </div>
        </div>
      </main>
      <Footer />

      {loginModal === "login" && (
        <Modal
          onClose={() => setLoginModal(null)}
          loginWithProvider={loginWithProvider}
          signInWithGoogleIdToken={signInWithGoogleIdToken}
        />
      )}

      {showSuccessModal && (
        <div className="cp-success-overlay" role="dialog" aria-modal="true" aria-labelledby="cp-success-title">
          <div className="cp-success-modal">
            <h2 id="cp-success-title" className="cp-success-title">Thanks for your submission!</h2>
            <button
              type="button"
              className="cp-success-close"
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
