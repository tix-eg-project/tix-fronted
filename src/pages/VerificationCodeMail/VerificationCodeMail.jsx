import React, { useState } from "react";
import axios from "axios";

export default function VerificationForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleResendCode = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://your-api.com/api/auth/user/resend-reset-code", {
        email,
      });
      setMessage(res.data.message || "Reset code sent!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending code");
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    // here you can call another API for verifying the code if backend provides
    if (code.trim()) {
      setMessage(`Entered code: ${code}`);
    } else {
      setMessage("Please enter the verification code.");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleResendCode}>
        <h2 style={styles.title}>Verification</h2>
        
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button}>
          Resend Code
        </button>
      </form>

      <form style={styles.form} onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Verify Code
        </button>
      </form>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#fff",
    color: "#000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  form: {
    border: "1px solid #000",
    padding: "20px",
    margin: "10px 0",
    borderRadius: "8px",
    width: "300px",
    textAlign: "center",
  },
  title: {
    marginBottom: "15px",
    fontSize: "20px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #000",
    borderRadius: "5px",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  message: {
    marginTop: "15px",
    fontSize: "14px",
    fontWeight: "500",
  },
};
