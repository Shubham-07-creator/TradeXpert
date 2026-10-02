import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL, DASHBOARD_URL } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const DEFAULT_CLIENT_ID =
  "499910353398-01upu2f47rj9d7sq5paeftngc0gjdat1.apps.googleusercontent.com";

function GoogleAuthButton({ isSignup = false }) {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const googleBtnRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customClientId, setCustomClientId] = useState("");

  const getCleanClientId = useCallback(() => {
    const localId = localStorage.getItem("google_client_id");
    if (localId && localId.includes(".apps.googleusercontent.com")) {
      return localId.trim();
    }
    const envId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (envId && envId.includes(".apps.googleusercontent.com")) {
      return envId.trim();
    }
    return DEFAULT_CLIENT_ID;
  }, []);

  const clientId = getCleanClientId();

  const handleCredentialResponse = useCallback(
    async (response) => {
      try {
        setLoading(true);
        toast.loading("Verifying with Google...", { id: "google-auth" });

        const res = await axios.post(`${API_URL}/auth/google`, {
          credential: response.credential,
        });

        toast.dismiss("google-auth");
        const { token, user } = res.data;
        login(token, user);
        toast.success(res.data.message || "Google authentication success! ✅");

        // Cross-origin exchange for Dashboard
        try {
          const codeRes = await axios.post(
            `${API_URL}/auth/code`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          window.location.href = `${DASHBOARD_URL}?code=${encodeURIComponent(
            codeRes.data.code
          )}`;
        } catch (codeErr) {
          window.location.href = DASHBOARD_URL;
        }
      } catch (err) {
        toast.dismiss("google-auth");
        console.error("Google auth failed:", err);
        toast.error(
          err.response?.data?.message || "Google authentication failed ❌"
        );
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  const handleDemoGoogleLogin = async () => {
    try {
      setLoading(true);
      setShowModal(false);
      toast.loading("Authenticating 1-Click Google Trader...", {
        id: "demo-auth",
      });

      const res = await axios.post(`${API_URL}/auth/google`, {
        credential: "demo-google-token",
        email: "google.trader@tradexpert.com",
        name: "Google Trader",
      });

      toast.dismiss("demo-auth");
      const { token, user } = res.data;
      login(token, user);
      toast.success("Google sign-in success! Welcome to TradeXpert 🚀");

      // Cross-origin exchange for Dashboard
      try {
        const codeRes = await axios.post(
          `${API_URL}/auth/code`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.location.href = `${DASHBOARD_URL}?code=${encodeURIComponent(
          codeRes.data.code
        )}`;
      } catch (codeErr) {
        window.location.href = DASHBOARD_URL;
      }
    } catch (err) {
      toast.dismiss("demo-auth");
      console.error("Demo Google login failed:", err);
      toast.error(err.response?.data?.message || "Demo sign in failed ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) return;

    let checkInterval = null;
    const scriptId = "google-jssdk";

    const renderGoogleBtn = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Clear previous render
          googleBtnRef.current.innerHTML = "";

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: "standard",
            theme: isDark ? "filled_black" : "outline",
            size: "large",
            width: 320,
            text: isSignup ? "signup_with" : "signin_with",
            shape: "pill",
            logo_alignment: "left",
          });

          setSdkReady(true);
        } catch (e) {
          console.warn("Google renderButton exception:", e);
        }
      }
    };

    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        renderGoogleBtn();
      };
      document.body.appendChild(script);
    } else {
      renderGoogleBtn();
    }

    // Polling retry for smooth initialization
    checkInterval = setInterval(() => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        renderGoogleBtn();
        clearInterval(checkInterval);
      }
    }, 250);

    const timeout = setTimeout(() => {
      if (checkInterval) clearInterval(checkInterval);
    }, 8000);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [clientId, isDark, isSignup, handleCredentialResponse]);

  const handleCustomButtonClick = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        console.warn("Prompt error:", e);
      }
    }
    setShowModal(true);
  };

  const handleSaveClientId = (e) => {
    e.preventDefault();
    if (!customClientId.trim()) {
      toast.error("Please enter a valid Client ID");
      return;
    }
    localStorage.setItem("google_client_id", customClientId.trim());
    toast.success("Google Client ID saved! Initializing Google SDK... ✅");
    setShowModal(false);
    window.location.reload();
  };

  return (
    <div className="w-100 my-2 text-center">
      {/* Container for Google's official rendered button */}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "44px" }}
      >
        <div ref={googleBtnRef} style={{ display: sdkReady && !loading ? "block" : "none" }} />

        {/* Custom fallback button shown when SDK is loading or on auth in progress */}
        {(!sdkReady || loading) && (
          <button
            type="button"
            onClick={handleCustomButtonClick}
            disabled={loading}
            className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
            style={{
              maxWidth: "320px",
              borderRadius: "30px",
              border: isDark ? "1px solid #334155" : "1px solid #E2E8F0",
              backgroundColor: isDark ? "#151F32" : "#FFFFFF",
              color: isDark ? "#F8FAFC" : "#1E293B",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.25s ease",
            }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Authenticating...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" className="me-1">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.24C.45 8.18 0 9.94 0 12s.45 3.82 1.24 5.39l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.61l4.03 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
                {isSignup ? "Sign up with Google" : "Continue with Google"}
              </>
            )}
          </button>
        )}
      </div>

      {/* Sub-actions: 1-Click Demo test + Setup Guide button */}
      <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
        <button
          type="button"
          onClick={handleDemoGoogleLogin}
          className="btn btn-link p-0 text-decoration-none"
          style={{
            fontSize: "12px",
            color: "#387ED1",
            fontWeight: "600",
          }}
          title="Instant 1-Click Google Sign In with ₹1,00,000 Wallet"
        >
          ⚡ 1-Click Google Test
        </button>
        <span className="text-muted" style={{ fontSize: "10px" }}>•</span>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="btn btn-link p-0 text-decoration-none"
          style={{
            fontSize: "12px",
            color: isDark ? "#94A3B8" : "#64748B",
            fontWeight: "500",
          }}
          title="Fix 'Error 401: invalid_client' or update Google Client ID"
        >
          ⚙️ Setup Guide / Error 401 Fix
        </button>
      </div>

      {/* Divider */}
      <div className="d-flex align-items-center my-3">
        <hr className="flex-grow-1 m-0 opacity-25" />
        <span
          className="px-3 small text-muted text-uppercase fw-semibold"
          style={{ fontSize: "11px", letterSpacing: "1px" }}
        >
          or with email
        </span>
        <hr className="flex-grow-1 m-0 opacity-25" />
      </div>

      {/* MODAL: Google OAuth Setup & Instant Test Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 1060,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "520px" }}
          >
            <div
              className="modal-content rounded-4 p-4 border-0 shadow-lg text-start"
              style={{
                backgroundColor: isDark ? "#151F32" : "#FFFFFF",
                color: isDark ? "#F8FAFC" : "#1E293B",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.24C.45 8.18 0 9.94 0 12s.45 3.82 1.24 5.39l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.61l4.03 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                    />
                  </svg>
                  <h5 className="mb-0 fw-bold">Google Sign-In Help &amp; Setup</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  style={{ filter: isDark ? "invert(1)" : "none" }}
                ></button>
              </div>

              {/* Instant Test Mode */}
              <div
                className="p-3 rounded-3 mb-3"
                style={{
                  background: isDark
                    ? "rgba(56, 126, 209, 0.12)"
                    : "#EBF2FC",
                  border: isDark ? "1px solid #243247" : "1px solid #D0E1F9",
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge bg-primary">Option 1: 1-Click Instant Test</span>
                  <small className="fw-semibold text-primary">
                    Bina Google Console ke Test Karein
                  </small>
                </div>
                <p
                  className="small mb-3"
                  style={{ color: isDark ? "#CBD5E1" : "#475569" }}
                >
                  Agar Google popup me koi error aa raha hai, to is button se
                  aapka TradeXpert Google authentication pipeline (auto user
                  creation, ₹1,00,000 wallet, dashboard redirect) turant test ho
                  jayega:
                </p>
                <button
                  type="button"
                  onClick={handleDemoGoogleLogin}
                  className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #387ED1 0%, #00D09C 100%)",
                    border: "none",
                    borderRadius: "20px",
                  }}
                >
                  <i className="fa-solid fa-bolt"></i> Sign In as Demo Google Trader
                </button>
              </div>

              {/* How to fix Error 401 invalid_client */}
              <div
                className="p-3 rounded-3 mb-3"
                style={{
                  background: isDark ? "rgba(239, 68, 68, 0.08)" : "#FEF2F2",
                  border: isDark ? "1px solid #7F1D1D" : "1px solid #FECACA",
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-danger">Error 401: invalid_client Fix</span>
                  <small className="fw-semibold text-danger">
                    Google Cloud Console Setting
                  </small>
                </div>
                <ol
                  className="small mb-0 ps-3"
                  style={{ color: isDark ? "#CBD5E1" : "#475569", lineHeight: 1.6 }}
                >
                  <li>
                    <b>OAuth Consent Screen (Audience):</b> Google Cloud Console me{" "}
                    <b>Google Auth Platform &gt; Audience</b> me <b>External</b> select karein aur Developer Email daal kar <b>Create/Save</b> karein.
                  </li>
                  <li>
                    <b>Authorised JavaScript Origins:</b> Google Cloud Console me{" "}
                    <b>Clients &gt; TradeXpert</b> me <code>https://www.example.com</code> ko hata kar yeh dono add karein:
                    <div className="mt-1">
                      <code className="text-primary me-2">http://localhost:3000</code>
                      <code className="text-primary">https://tradexpert-vq6s.onrender.com</code>
                    </div>
                  </li>
                  <li>
                    <b>Add Test User:</b> <b>Audience &gt; Test Users</b> me apna Gmail (<code>shubhamkumar979883@gmail.com</code>) add karein.
                  </li>
                </ol>
              </div>

              {/* Update Client ID */}
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge bg-secondary">Current Client ID</span>
                  <small className="text-muted fw-semibold">
                    Change if you generated a new one
                  </small>
                </div>
                <p className="small text-muted mb-2">
                  Active Client ID:{" "}
                  <code style={{ fontSize: "11px", wordBreak: "break-all" }}>
                    {clientId}
                  </code>
                </p>
                <form onSubmit={handleSaveClientId} className="d-flex gap-2">
                  <input
                    type="text"
                    placeholder="New client ID (xxxx.apps.googleusercontent.com)"
                    value={customClientId}
                    onChange={(e) => setCustomClientId(e.target.value)}
                    className="form-control form-control-sm"
                    style={{
                      background: isDark ? "#0B1120" : "#FFFFFF",
                      color: isDark ? "#F8FAFC" : "#1E293B",
                      borderColor: isDark ? "#243247" : "#E2E8F0",
                      fontSize: "12px",
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-sm btn-outline-primary fw-semibold px-3 text-nowrap"
                  >
                    Save &amp; Reload
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoogleAuthButton;
