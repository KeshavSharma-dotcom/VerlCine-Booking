import React, { useState, useEffect } from "react"
import {
    useGetCurrentUserQuery,
    useRequest2FAOTPMutation,
    useVerify2FAToggleMutation,
    useDisable2FAMutation
} from "../services/authApi"
import "../../../assets/styles/privacy.css"

export const PrivacySettings: React.FC = () => {
    const { data } = useGetCurrentUserQuery()
    const [requestOTP, { isLoading: isSendingOTP }] = useRequest2FAOTPMutation()
    const [verifyToggle, { isLoading: isVerifying }] = useVerify2FAToggleMutation()
    const [disable2FA, { isLoading: isDisabling }] = useDisable2FAMutation()

    const [showOTPInput, setShowOTPInput] = useState<boolean>(() => {
        const expiry = localStorage.getItem("otp_expires_at")
        return expiry ? Date.now() < parseInt(expiry, 10) : false
    })
    const [otp, setOtp] = useState("")
    const [timeLeft, setTimeLeft] = useState<number>(() => {
        const expiry = localStorage.getItem("otp_expires_at")
        if (!expiry) return 0
        const diff = Math.floor((parseInt(expiry, 10) - Date.now()) / 1000)
        return diff > 0 ? diff : 0
    })

    useEffect(() => {
        if (timeLeft <= 0) return

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [timeLeft])

    const startOTPTimer = () => {
        const expiresAt = Date.now() + 5 * 60 * 1000
        localStorage.setItem("otp_expires_at", expiresAt.toString())
        setTimeLeft(300)
        setShowOTPInput(true)
    }

    const handleEnableClick = async () => {
        try {
            await requestOTP().unwrap()
            startOTPTimer()
        } catch (err) {
            console.error(err)
        }
    }

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const result = await verifyToggle({ otp }).unwrap()
            if (result.success) {
                localStorage.removeItem("otp_expires_at")
                setShowOTPInput(false)
                setOtp("")
                setTimeLeft(0)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDisableClick = async () => {
        try {
            await disable2FA().unwrap()
            localStorage.removeItem("otp_expires_at")
            setShowOTPInput(false)
            setOtp("")
        } catch (err) {
            console.error(err)
        }
    }

    const is2FAEnabled = data?.user?.isTwoFactorEnabled

    return (
        <div className="privacy-card">
            <div className="privacy-header">
                <div>
                    <h3 className="privacy-title">Two-Factor Authentication</h3>
                    <p className="privacy-desc">Protect your account with an email OTP code.</p>
                </div>
                {is2FAEnabled ? (
                    <button onClick={handleDisableClick} disabled={isDisabling} className="toggle-btn toggle-btn-disable">
                        {isDisabling ? "Disabling..." : "Disable 2FA"}
                    </button>
                ) : (
                    <button onClick={handleEnableClick} disabled={isSendingOTP} className="toggle-btn toggle-btn-enable">
                        {isSendingOTP ? "Sending Code..." : "Enable 2FA"}
                    </button>
                )}
            </div>

            {!is2FAEnabled && showOTPInput && (
                <div className="otp-inline-box">
                    <p className="text-sm text-slate-300 text-center">
                        Enter the 6-digit OTP code sent to your email to verify.
                    </p>
                    <form onSubmit={handleVerifySubmit} className="space-y-3">
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            className="otp-inline-input"
                        />
                        <button type="submit" disabled={isVerifying || otp.length !== 6} className="verify-btn">
                            {isVerifying ? "Verifying..." : "Verify & Activate 2FA"}
                        </button>
                    </form>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                        {timeLeft > 0 ? (
                            <span>Expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
                        ) : (
                            <span className="text-red-400">OTP Expired</span>
                        )}
                        <button type="button" onClick={handleEnableClick} disabled={timeLeft > 0 || isSendingOTP} className="resend-btn">
                            Resend OTP
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}