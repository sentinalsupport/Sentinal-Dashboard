<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sentinal — Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #080E1A;
            color: #E8EDF5;
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        ::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        ::-webkit-scrollbar-track {
            background: #080E1A;
        }
        ::-webkit-scrollbar-thumb {
            background: #1E4B8A;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #2563EB;
        }

        .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 32px;
        }

        /* ===== NAVBAR ===== */
        .navbar {
            background: rgba(8, 14, 26, 0.92);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            padding: 0 32px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .navbar .brand {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
            font-weight: 700;
            color: #FFFFFF;
            text-decoration: none;
            letter-spacing: -0.3px;
        }

        .navbar .brand .logo-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #2563EB, #1D4ED8);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
        }

        .navbar .brand span {
            color: #60A5FA;
        }

        .navbar .nav-links {
            display: flex;
            align-items: center;
            gap: 28px;
        }

        .navbar .nav-links a {
            color: #8B9BB5;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            transition: color 0.2s ease;
            cursor: pointer;
        }

        .navbar .nav-links a:hover {
            color: #E8EDF5;
        }

        .navbar .nav-links a.active {
            color: #FFFFFF;
            position: relative;
        }

        .navbar .nav-links a.active::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 2px;
            background: #2563EB;
            border-radius: 2px;
        }

        .navbar .nav-right {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .navbar .premium-btn {
            background: linear-gradient(135deg, #F59E0B, #D97706);
            color: #FFFFFF;
            padding: 6px 18px;
            border-radius: 100px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .navbar .premium-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(245, 158, 11, 0.25);
        }

        .navbar .logout-btn {
            background: rgba(255, 255, 255, 0.06);
            color: #8B9BB5;
            padding: 6px 16px;
            border-radius: 100px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid rgba(255, 255, 255, 0.06);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
        }

        .navbar .logout-btn:hover {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
            border-color: rgba(239, 68, 68, 0.2);
        }

        .navbar .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2563EB, #1D4ED8);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            color: #FFFFFF;
        }

        .navbar .login-btn {
            background: linear-gradient(135deg, #2563EB, #1D4ED8);
            color: #FFFFFF;
            padding: 6px 20px;
            border-radius: 100px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
        }

        .navbar .login-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(37, 99, 235, 0.25);
        }

        .navbar .status-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            padding: 4px 12px;
            border-radius: 100px;
            background: rgba(34, 197, 94, 0.12);
            color: #4ADE80;
            border: 1px solid rgba(34, 197, 94, 0.15);
        }

        .navbar .status-badge .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4ADE80;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        .navbar .status-badge.maintenance {
            background: rgba(245, 158, 11, 0.12);
            color: #FBBF24;
            border-color: rgba(245, 158, 11, 0.15);
        }

        .navbar .status-badge.maintenance .dot {
            background: #FBBF24;
        }

        .navbar .status-badge.offline {
            background: rgba(239, 68, 68, 0.12);
            color: #EF4444;
            border-color: rgba(239, 68, 68, 0.15);
        }

        .navbar .status-badge.offline .dot {
            background: #EF4444;
        }

        /* ===== HERO ===== */
        .hero {
            padding: 48px 0 24px;
            text-align: center;
        }

        .hero .badge {
            display: inline-block;
            background: rgba(37, 99, 235, 0.1);
            color: #60A5FA;
            padding: 4px 14px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border: 1px solid rgba(96, 165, 250, 0.08);
            margin-bottom: 16px;
        }

        .hero h1 {
            font-size: 40px;
            font-weight: 800;
            line-height: 1.15;
            color: #FFFFFF;
            letter-spacing: -0.5px;
            margin-bottom: 10px;
        }

        .hero h1 span {
            background: linear-gradient(135deg, #60A5FA, #2563EB);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }

        .hero p {
            color: #8B9BB5;
            font-size: 16px;
            max-width: 520px;
            margin: 0 auto 24px;
            line-height: 1.7;
            font-weight: 400;
        }

        .hero .cta-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .hero .btn-primary {
            background: linear-gradient(135deg, #2563EB, #1D4ED8);
            color: #FFFFFF;
            padding: 11px 32px;
            border-radius: 100px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: none;
            cursor: pointer;
        }

        .hero .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 28px rgba(37, 99, 235, 0.25);
        }

        .hero .btn-secondary {
            background: rgba(255, 255, 255, 0.04);
            color: #E8EDF5;
            padding: 11px 32px;
            border-radius: 100px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }

        .hero .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.12);
        }

        /* ===== STATS ===== */
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            padding: 8px 0 40px;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 12px;
            padding: 20px 24px;
            text-align: center;
            transition: all 0.2s ease;
        }

        .stat-card:hover {
            background: rgba(255, 255, 255, 0.035);
            border-color: rgba(255, 255, 255, 0.07);
        }

        .stat-card .number {
            font-size: 30px;
            font-weight: 700;
            color: #FFFFFF;
            letter-spacing: -0.5px;
            margin-bottom: 2px;
        }

        .stat-card .label {
            color: #8B9BB5;
            font-size: 13px;
            font-weight: 400;
        }

        /* ===== MAIN CONTENT ===== */
        .main-content {
            padding-bottom: 48px;
        }

        .section-header {
            margin-bottom: 20px;
        }

        .section-header h2 {
            font-size: 24px;
            font-weight: 700;
            color: #FFFFFF;
            letter-spacing: -0.3px;
            margin-bottom: 4px;
        }

        .section-header p {
            color: #8B9BB5;
            font-size: 15px;
            line-height: 1.6;
            max-width: 600px;
        }

        .features-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 32px;
        }

        .feature-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 14px;
            padding: 28px 28px 24px;
            transition: all 0.2s ease;
        }

        .feature-card:hover {
            background: rgba(255, 255, 255, 0.035);
            border-color: rgba(255, 255, 255, 0.07);
        }

        .feature-card .icon {
            width: 44px;
            height: 44px;
            background: rgba(37, 99, 235, 0.12);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            margin-bottom: 14px;
        }

        .feature-card h4 {
            font-size: 17px;
            font-weight: 600;
            color: #FFFFFF;
            margin-bottom: 6px;
        }

        .feature-card p {
            color: #8B9BB5;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 14px;
        }

        .feature-card .feature-actions {
            display: flex;
            gap: 16px;
        }

        .feature-card .feature-actions a {
            color: #60A5FA;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            transition: color 0.2s ease;
            cursor: pointer;
        }

        .feature-card .feature-actions a:hover {
            color: #93BBFC;
        }

        /* ===== SUBMISSION ===== */
        .submission-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 14px;
            padding: 28px;
            margin-bottom: 32px;
        }

        .submission-card .submission-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            flex-wrap: wrap;
            gap: 8px;
        }

        .submission-card .submission-header h4 {
            font-size: 16px;
            font-weight: 600;
            color: #FFFFFF;
        }

        .submission-card .submission-header .status {
            background: rgba(34, 197, 94, 0.12);
            color: #4ADE80;
            padding: 3px 12px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 600;
        }

        .submission-card .question {
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .submission-card .question:last-child {
            border-bottom: none;
        }

        .submission-card .question .q {
            color: #8B9BB5;
            font-size: 13px;
            font-weight: 500;
        }

        .submission-card .question .a {
            color: #E8EDF5;
            font-size: 14px;
            margin-top: 2px;
        }

        .submission-actions {
            display: flex;
            gap: 8px;
            margin-top: 18px;
            flex-wrap: wrap;
        }

        .submission-actions button {
            padding: 7px 18px;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .submission-actions .accept {
            background: #22C55E;
            color: #FFFFFF;
        }

        .submission-actions .accept:hover {
            background: #16A34A;
        }

        .submission-actions .deny {
            background: #EF4444;
            color: #FFFFFF;
        }

        .submission-actions .deny:hover {
            background: #DC2626;
        }

        .submission-actions .secondary {
            background: rgba(255, 255, 255, 0.05);
            color: #8B9BB5;
            border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .submission-actions .secondary:hover {
            background: rgba(255, 255, 255, 0.08);
        }

        /* ===== TICKET ===== */
        .ticket-actions {
            display: flex;
            gap: 8px;
            margin-top: 14px;
            flex-wrap: wrap;
        }

        .ticket-actions button {
            padding: 7px 18px;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: rgba(255, 255, 255, 0.05);
            color: #8B9BB5;
            border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .ticket-actions button:hover {
            background: rgba(255, 255, 255, 0.08);
        }

        .ticket-actions .close {
            background: #EF4444;
            color: #FFFFFF;
            border: none;
        }

        .ticket-actions .close:hover {
            background: #DC2626;
        }

        /* ===== GIVEAWAY ===== */
        .giveaway-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 14px;
            padding: 28px;
            margin-bottom: 32px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            align-items: center;
        }

        .giveaway-card .giveaway-info .prize {
            font-size: 22px;
            font-weight: 700;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .giveaway-card .giveaway-info .prize .badge-giveaway {
            background: rgba(245, 158, 11, 0.12);
            color: #FBBF24;
            font-size: 11px;
            padding: 2px 12px;
            border-radius: 100px;
            font-weight: 600;
        }

        .giveaway-card .giveaway-info .meta {
            color: #8B9BB5;
            font-size: 13px;
            margin: 6px 0 12px;
        }

        .giveaway-card .giveaway-info .meta span {
            color: #60A5FA;
        }

        .giveaway-card .giveaway-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .giveaway-card .giveaway-actions .enter-btn {
            background: linear-gradient(135deg, #2563EB, #1D4ED8);
            color: #FFFFFF;
            padding: 11px;
            border-radius: 10px;
            border: none;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .giveaway-card .giveaway-actions .enter-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(37, 99, 235, 0.25);
        }

        .giveaway-card .giveaway-actions .entrants {
            color: #8B9BB5;
            font-size: 13px;
            text-align: center;
        }

        /* ===== VERIFICATION ===== */
        .verification-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 14px;
            padding: 28px;
            margin-bottom: 32px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            align-items: center;
        }

        .verification-card .verification-info h4 {
            font-size: 17px;
            font-weight: 600;
            color: #FFFFFF;
            margin-bottom: 4px;
        }

        .verification-card .verification-info p {
            color: #8B9BB5;
            font-size: 14px;
            line-height: 1.6;
        }

        .verification-card .verification-info .feature-actions {
            margin-top: 12px;
            display: flex;
            gap: 16px;
        }

        .verification-card .verification-info .feature-actions a {
            color: #60A5FA;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            transition: color 0.2s ease;
            cursor: pointer;
        }

        .verification-card .verification-info .feature-actions a:hover {
            color: #93BBFC;
        }

        .verification-card .captcha-box {
            background: rgba(0, 0, 0, 0.25);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .verification-card .captcha-box .captcha-display {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 10px;
            color: #60A5FA;
            font-family: 'Courier New', monospace;
            background: rgba(0, 0, 0, 0.3);
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 10px;
        }

        .verification-card .captcha-box input {
            width: 100%;
            padding: 9px 14px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(0, 0, 0, 0.3);
            color: #E8EDF5;
            font-size: 13px;
            outline: none;
            transition: border-color 0.2s ease;
        }

        .verification-card .captcha-box input:focus {
            border-color: #2563EB;
        }

        .verification-card .captcha-box .verify-btn {
            width: 100%;
            margin-top: 10px;
            padding: 9px;
            background: linear-gradient(135deg, #2563EB, #1D4ED8);
            color: #FFFFFF;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .verification-card .captcha-box .verify-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);
        }

        /* ===== TESTIMONIALS ===== */
        .testimonials {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 14px;
            padding: 28px;
            margin-bottom: 32px;
        }

        .testimonials .rating-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .testimonials .rating-header h3 {
            font-size: 18px;
            font-weight: 700;
            color: #FFFFFF;
        }

        .testimonials .rating-header .stars {
            color: #FBBF24;
            font-size: 16px;
            letter-spacing: 1px;
        }

        .testimonials .rating-header .avg {
            color: #8B9BB5;
            font-size: 13px;
            font-weight: 500;
        }

        .testimonial-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
        }

        .testimonial-item {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .testimonial-item .stars-small {
            color: #FBBF24;
            font-size: 13px;
            letter-spacing: 1px;
            margin-bottom: 6px;
        }

        .testimonial-item p {
            color: #8B9BB5;
            font-size: 13px;
            line-height: 1.6;
            margin-bottom: 10px;
        }

        .testimonial-item .author {
            font-weight: 600;
            color: #E8EDF5;
            font-size: 14px;
        }

        .testimonial-item .role {
            color: #5A6B85;
            font-size: 12px;
        }

        /* ===== PREMIUM SECTION ===== */
        .premium-section {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.04), rgba(217, 119, 6, 0.01));
            border: 1px solid rgba(245, 158, 11, 0.08);
            border-radius: 14px;
            padding: 36px 40px;
            text-align: center;
            margin-bottom: 32px;
        }

        .premium-section h2 {
            font-size: 28px;
            font-weight: 800;
            color: #FFFFFF;
            margin-bottom: 6px;
        }

        .premium-section h2 span {
            background: linear-gradient(135deg, #FBBF24, #F59E0B);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }

        .premium-section p {
            color: #8B9BB5;
            font-size: 15px;
            max-width: 460px;
            margin: 0 auto 20px;
        }

        .premium-plans {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            max-width: 600px;
            margin: 0 auto 24px;
        }

        .premium-plan {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 14px;
            padding: 24px;
            transition: all 0.2s ease;
        }

        .premium-plan:hover {
            transform: translateY(-4px);
            border-color: rgba(245, 158, 11, 0.2);
            box-shadow: 0 8px 32px rgba(245, 158, 11, 0.05);
        }

        .premium-plan.featured {
            border-color: rgba(245, 158, 11, 0.3);
            background: rgba(245, 158, 11, 0.05);
        }

        .premium-plan .plan-name {
            font-size: 18px;
            font-weight: 700;
            color: #FFFFFF;
            margin-bottom: 4px;
        }

        .premium-plan .plan-price {
            font-size: 32px;
            font-weight: 800;
            color: #FBBF24;
            margin-bottom: 12px;
        }

        .premium-plan .plan-price span {
            font-size: 16px;
            font-weight: 400;
            color: #8B9BB5;
        }

        .premium-plan .plan-features {
            list-style: none;
            text-align: left;
            margin-bottom: 16px;
        }

        .premium-plan .plan-features li {
            color: #8B9BB5;
            font-size: 13px;
            padding: 4px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .premium-plan .plan-features li i {
            color: #FBBF24;
            font-size: 12px;
        }

        .premium-plan .plan-btn {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: linear-gradient(135deg, #2563EB, #1D4ED8);
            color: #FFFFFF;
        }

        .premium-plan .plan-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(37, 99, 235, 0.25);
        }

        .premium-plan.featured .plan-btn {
            background: linear-gradient(135deg, #F59E0B, #D97706);
        }

        .premium-plan.featured .plan-btn:hover {
            box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
        }

        .premium-features {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 24px;
        }

        .premium-features .pf-item {
            background: rgba(255, 255, 255, 0.03);
            padding: 8px 18px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.04);
            color: #E8EDF5;
            font-size: 13px;
            font-weight: 500;
        }

        .premium-features .pf-item i {
            color: #FBBF24;
            margin-right: 8px;
        }

        /* ===== FOOTER ===== */
        .footer {
            border-top: 1px solid rgba(255, 255, 255, 0.04);
            padding: 32px 0 24px;
        }

        .footer .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 32px;
            margin-bottom: 24px;
        }

        .footer .footer-brand h4 {
            font-size: 18px;
            font-weight: 700;
            color: #FFFFFF;
            margin-bottom: 4px;
        }

        .footer .footer-brand h4 span {
            color: #60A5FA;
        }

        .footer .footer-brand p {
            color: #5A6B85;
            font-size: 13px;
        }

        .footer .footer-col h5 {
            font-weight: 600;
            font-size: 13px;
            color: #E8EDF5;
            margin-bottom: 10px;
        }

        .footer .footer-col a {
            display: block;
            color: #5A6B85;
            text-decoration: none;
            font-size: 13px;
            padding: 3px 0;
            transition: color 0.2s ease;
            cursor: pointer;
        }

        .footer .footer-col a:hover {
            color: #60A5FA;
        }

        .footer .footer-bottom {
            border-top: 1px solid rgba(255, 255, 255, 0.04);
            padding-top: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            color: #5A6B85;
            font-size: 13px;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
            .giveaway-card,
            .verification-card {
                grid-template-columns: 1fr;
            }

            .footer .footer-grid {
                grid-template-columns: 1fr 1fr;
            }

            .premium-plans {
                grid-template-columns: 1fr;
                max-width: 400px;
            }
        }

        @media (max-width: 768px) {
            .container {
                padding: 0 20px;
            }

            .navbar {
                padding: 0 20px;
                height: 58px;
                flex-wrap: wrap;
                gap: 8px;
            }

            .navbar .nav-links {
                gap: 16px;
            }

            .navbar .nav-links a {
                font-size: 12px;
            }

            .navbar .nav-links a.active::after {
                bottom: -17px;
            }

            .hero h1 {
                font-size: 30px;
            }

            .hero p {
                font-size: 15px;
            }

            .stats {
                grid-template-columns: 1fr 1fr;
            }

            .features-grid {
                grid-template-columns: 1fr;
            }

            .testimonial-grid {
                grid-template-columns: 1fr;
            }

            .footer .footer-grid {
                grid-template-columns: 1fr 1fr;
                gap: 24px;
            }
        }

        @media (max-width: 480px) {
            .stats {
                grid-template-columns: 1fr;
            }

            .navbar .nav-links {
                gap: 12px;
            }

            .navbar .nav-links a {
                font-size: 11px;
            }

            .navbar .brand {
                font-size: 15px;
            }

            .navbar .nav-right {
                gap: 8px;
                flex-wrap: wrap;
            }

            .hero h1 {
                font-size: 26px;
            }

            .submission-actions {
                flex-direction: column;
            }

            .submission-actions button {
                width: 100%;
            }

            .footer .footer-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }

            .footer .footer-bottom {
                flex-direction: column;
                text-align: center;
            }

            .premium-plans {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- ===== NAVBAR ===== -->
    <nav class="navbar">
        <a href="#" class="brand" onclick="scrollToTop()">
            <div class="logo-icon">⚡</div>
            Sentinal <span>Dashboard</span>
        </a>
        <div class="nav-links">
            <a href="#" class="active" onclick="scrollToTop()">Home</a>
            <a href="#" onclick="scrollToSection('features')">Features</a>
            <a href="#" onclick="scrollToSection('premium')">Premium</a>
            <a href="#" onclick="window.open('https://discord.gg/UmqmewYWRd', '_blank')">Support</a>
        </div>
        <div class="nav-right">
            <span class="status-badge">
                <span class="dot"></span>
                Online
            </span>
            <% if (isAuthenticated) { %>
                <div class="user-avatar">8a</div>
                <a href="/logout" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
            <% } else { %>
                <a href="/login" class="login-btn"><i class="fas fa-sign-in-alt"></i> Login</a>
            <% } %>
        </div>
    </nav>

    <!-- ===== HERO ===== -->
    <section class="hero" id="home">
        <div class="container">
            <div class="badge">✦ Free & Highly Customizable</div>
            <h1>A free and highly<br />customizable Discord <span>application bot</span></h1>
            <p>Sentinal is an easy to use, powerful and highly customizable Discord bot. With over 15 customizable settings for your applications to benefit from.</p>
            <div class="cta-buttons">
                <a href="#" class="btn-primary" onclick="handleGetStarted()"><i class="fas fa-rocket"></i> Get Started</a>
                <a href="#" class="btn-secondary" onclick="scrollToSection('features')"><i class="fas fa-arrow-down"></i> Learn More</a>
            </div>
        </div>
    </section>

    <!-- ===== STATS ===== -->
    <div class="container">
        <div class="stats">
            <div class="stat-card">
                <div class="number">254</div>
                <div class="label">Total applications</div>
            </div>
            <div class="stat-card">
                <div class="number">7</div>
                <div class="label">Total servers</div>
            </div>
            <div class="stat-card">
                <div class="number">56</div>
                <div class="label">Total applicants</div>
            </div>
        </div>
    </div>

    <!-- ===== MAIN CONTENT ===== -->
    <div class="container main-content">
        <!-- FEATURES SECTION -->
        <div id="features">
            <div class="section-header">
                <h2>Applications</h2>
                <p>Sentinal's built in Discord application and forms feature makes filling out questionnaires and forms easy. With a simple and intuitive interface you can get a fully functional form system up and running in your Discord server in minutes.</p>
            </div>

            <div class="features-grid">
                <div class="feature-card">
                    <div class="icon">📋</div>
                    <h4>Applications</h4>
                    <p>Create custom application forms for staff, events, or any purpose. Review and manage submissions with ease.</p>
                    <div class="feature-actions">
                        <a href="#" onclick="handleGetStarted()"><i class="fas fa-arrow-right"></i> Get Started</a>
                        <a href="#" onclick="scrollToSection('features')"><i class="fas fa-book"></i> Learn more</a>
                    </div>
                </div>

                <div class="feature-card">
                    <div class="icon">🎫</div>
                    <h4>Tickets</h4>
                    <p>Our ticketing system can help you and your server manage support requests, questions and other inquiries within your Discord server.</p>
                    <div class="feature-actions">
                        <a href="#" onclick="handleGetStarted()"><i class="fas fa-arrow-right"></i> Get Started</a>
                        <a href="#" onclick="scrollToSection('features')"><i class="fas fa-book"></i> Learn more</a>
                    </div>
                </div>
            </div>

            <!-- APPLICATION SUBMISSION -->
            <div class="submission-card">
                <div class="submission-header">
                    <h4>📝 8a's 'Staff application' Application Submitted</h4>
                    <span class="status">● Pending Review</span>
                </div>
                <div class="question">
                    <div class="q">1. Do you like dogs?</div>
                    <div class="a">Yes!</div>
                </div>
                <div class="question">
                    <div class="q">2. Are capybara the best animal?</div>
                    <div class="a">Yes</div>
                </div>
                <div class="submission-actions">
                    <button class="accept"><i class="fas fa-check"></i> Accept</button>
                    <button class="deny"><i class="fas fa-times"></i> Deny</button>
                    <button class="secondary"><i class="fas fa-pen"></i> Accept with reason</button>
                    <button class="secondary"><i class="fas fa-pen"></i> Deny with reason</button>
                    <button class="secondary"><i class="fas fa-history"></i> History</button>
                    <button class="secondary"><i class="fas fa-ticket"></i> Open ticket with user</button>
                    <button class="secondary"><i class="fas fa-external-link-alt"></i> View submission on dashboard</button>
                </div>
            </div>

            <!-- TICKETS -->
            <div class="section-header" style="margin-top: 32px;">
                <h2>Tickets</h2>
                <p>Our ticketing system can help you and your server manage support requests, questions and other inquiries within your Discord server.</p>
            </div>

            <div class="feature-card">
                <div class="icon">🎫</div>
                <h4>Support Tickets</h4>
                <p>Manage all your support tickets in one place. Close tickets with or without a reason.</p>
                <div class="feature-actions">
                    <a href="#" onclick="handleGetStarted()"><i class="fas fa-arrow-right"></i> Get Started</a>
                    <a href="#" onclick="scrollToSection('features')"><i class="fas fa-book"></i> Learn more</a>
                </div>
                <div class="ticket-actions">
                    <button class="close"><i class="fas fa-times"></i> Close</button>
                    <button><i class="fas fa-pen"></i> Close with reason</button>
                </div>
            </div>

            <!-- GIVEAWAY -->
            <div class="section-header" style="margin-top: 32px;">
                <h2>Giveaways</h2>
                <p>Host giveaways and contests in your Discord server with Sentinal's built-in Discord giveaway system.</p>
            </div>

            <div class="giveaway-card">
                <div class="giveaway-info">
                    <div class="prize">
                        🎁 nitro
                        <span class="badge-giveaway">Total Winners: 1</span>
                    </div>
                    <div class="meta">Ends in: <span>in a day</span> • Hosted By: <span>@8au</span></div>
                    <div style="color: #5A6B85; font-size: 13px;">
                        <i class="fas fa-users"></i> Entrants: 2
                    </div>
                </div>
                <div class="giveaway-actions">
                    <button class="enter-btn"><i class="fas fa-gift"></i> Enter Giveaway</button>
                    <div class="entrants">👥 Entrants (2)</div>
                </div>
            </div>

            <!-- VERIFICATION -->
            <div class="section-header" style="margin-top: 32px;">
                <h2>Verification</h2>
                <p>Having problems with spam bots and low quality users in your Discord server? Enable Sentinal's verification captcha system to ensure that only real users can access your Discord server.</p>
            </div>

            <div class="verification-card">
                <div class="verification-info">
                    <h4>🔒 Verify your identity</h4>
                    <p>To gain access to the contents of this server you must verify yourself by completing the captcha below.</p>
                    <div class="feature-actions">
                        <a href="#" onclick="handleGetStarted()"><i class="fas fa-arrow-right"></i> Get Started</a>
                        <a href="#" onclick="scrollToSection('features')"><i class="fas fa-book"></i> Learn more</a>
                    </div>
                </div>
                <div class="captcha-box">
                    <div class="captcha-display">A7K2P</div>
                    <input type="text" placeholder="Enter the code above" />
                    <button class="verify-btn"><i class="fas fa-shield-alt"></i> Verify</button>
                </div>
            </div>
        </div>

        <!-- TESTIMONIALS -->
        <div class="testimonials">
            <div class="rating-header">
                <h3>Loved by the biggest Discord communities</h3>
                <span class="stars">⭐⭐⭐⭐⭐</span>
                <span class="avg">4.9 average rating</span>
            </div>

            <div class="testimonial-grid">
                <div class="testimonial-item">
                    <div class="stars-small">★★★★★</div>
                    <p>"I like the Sentinal bot because it is synced with Discord. We do not have to redirect players away from Discord like Google Forms."</p>
                    <div class="author">Flameco</div>
                    <div class="role">Stumble Guys</div>
                </div>
                <div class="testimonial-item">
                    <div class="stars-small">★★★★★</div>
                    <p>"Sentinal has been the best tool available to meet all our application needs. It turns a workload of over an hour into a simple 2 to 5 minute read."</p>
                    <div class="author">Gravy</div>
                    <div class="role">Lost Ark</div>
                </div>
                <div class="testimonial-item">
                    <div class="stars-small">★★★★★</div>
                    <p>"We like it because it has many different features, it meets all of our requirements! It was easy to set up and easy-to-use."</p>
                    <div class="author">Admin team</div>
                    <div class="role">Last Day On Earth</div>
                </div>
            </div>
        </div>

        <!-- PREMIUM SECTION -->
        <div id="premium">
            <div class="premium-section">
                <h2>Unlock the full power of <span>Sentinal Premium</span></h2>
                <p>Unlock additional features and support the continued development of Sentinal.</p>

                <div class="premium-plans">
                    <div class="premium-plan">
                        <div class="plan-name">Sentinal+</div>
                        <div class="plan-price">$7.99 <span>/ month</span></div>
                        <ul class="plan-features">
                            <li><i class="fas fa-check"></i> Customizable application manager roles</li>
                            <li><i class="fas fa-check"></i> Customizable application tickets</li>
                            <li><i class="fas fa-check"></i> Priority support</li>
                            <li><i class="fas fa-check"></i> 5 servers included</li>
                        </ul>
                        <button class="plan-btn" onclick="handleUpgrade('plus')">Upgrade to Plus</button>
                    </div>

                    <div class="premium-plan featured">
                        <div class="plan-name">Sentinal++</div>
                        <div class="plan-price">$13.99 <span>/ month</span></div>
                        <ul class="plan-features">
                            <li><i class="fas fa-check"></i> Everything in Plus</li>
                            <li><i class="fas fa-check"></i> Customizable completion messages</li>
                            <li><i class="fas fa-check"></i> Unlimited servers</li>
                            <li><i class="fas fa-check"></i> Early access to features</li>
                            <li><i class="fas fa-check"></i> Dedicated support channel</li>
                        </ul>
                        <button class="plan-btn" onclick="handleUpgrade('pro')">Upgrade to Pro</button>
                    </div>
                </div>

                <div class="premium-features">
                    <div class="pf-item"><i class="fas fa-check"></i> Customizable application manager roles</div>
                    <div class="pf-item"><i class="fas fa-check"></i> Customizable application tickets</div>
                    <div class="pf-item"><i class="fas fa-check"></i> Customizable completion messages</div>
                    <div class="pf-item"><i class="fas fa-check"></i> and much more...</div>
                </div>
            </div>
        </div>
    </div>

    <!-- ===== FOOTER ===== -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <h4>Sentinal <span>Dashboard</span></h4>
                    <p>Discord application bot</p>
                    <p style="margin-top: 4px;">admin@sentinal.xyz</p>
                </div>
                <div class="footer-col">
                    <h5>Features</h5>
                    <a href="#" onclick="scrollToSection('features')">Tickets</a>
                    <a href="#" onclick="scrollToSection('features')">Applications</a>
                    <a href="#" onclick="scrollToSection('features')">Giveaways</a>
                    <a href="#" onclick="scrollToSection('features')">Verification</a>
                </div>
                <div class="footer-col">
                    <h5>Useful links</h5>
                    <a href="#" onclick="scrollToTop()">Home</a>
                    <a href="#" onclick="window.open('https://discord.gg/UmqmewYWRd', '_blank')">Support</a>
                    <a href="#" onclick="scrollToSection('premium')">Premium</a>
                    <a href="#" onclick="scrollToSection('features')">Documentation</a>
                </div>
                <div class="footer-col">
                    <h5>Policies</h5>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Refund Policy</a>
                </div>
            </div>
            <div class="footer-bottom">
                <span>© 2026 Sentinal — Discord application bot</span>
                <span>Made with ❤️</span>
            </div>
        </div>
    </footer>

    <!-- ===== SCRIPTS ===== -->
    <script>
        // ===== SCROLL FUNCTIONS =====
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function scrollToSection(id) {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        // ===== HANDLE GET STARTED =====
        function handleGetStarted() {
            <% if (isAuthenticated) { %>
                // If logged in, scroll to features
                scrollToSection('features');
            <% } else { %>
                // If not logged in, redirect to login
                window.location.href = '/login';
            <% } %>
        }

        // ===== HANDLE UPGRADE =====
        function handleUpgrade(plan) {
            <% if (isAuthenticated) { %>
                alert(`Thank you for choosing Sentinal ${plan.toUpperCase()}! 🎉\nYou will be redirected to checkout.`);
                // Here you would redirect to payment page
                // window.location.href = `/checkout?plan=${plan}`;
            <% } else { %>
                alert('Please login first to upgrade to Premium! 🔐');
                window.location.href = '/login';
            <% } %>
        }

        // ===== NAVIGATION CLICKS =====
        document.querySelectorAll('.nav-links a').forEach(function(link) {
            link.addEventListener('click', function(e) {
                document.querySelectorAll('.nav-links a').forEach(function(l) {
                    l.classList.remove('active');
                });
                this.classList.add('active');
            });
        });

        // ===== ACCEPT BUTTONS =====
        document.querySelectorAll('.accept').forEach(function(btn) {
            btn.addEventListener('click', function() {
                alert('Application accepted! ✅');
            });
        });

        // ===== DENY BUTTONS =====
        document.querySelectorAll('.deny').forEach(function(btn) {
            btn.addEventListener('click', function() {
                alert('Application denied. ❌');
            });
        });

        // ===== VERIFY BUTTON =====
        document.querySelector('.verify-btn').addEventListener('click', function() {
            const input = document.querySelector('.captcha-box input');
            if (input.value.toUpperCase() === 'A7K2P') {
                alert('✅ Verification successful! You are now verified.');
            } else {
                alert('❌ Invalid code. Please try again.');
            }
        });

        // ===== ENTER GIVEAWAY =====
        document.querySelector('.enter-btn').addEventListener('click', function() {
            alert('You have entered the giveaway! Good luck! 🎉');
        });

        // ===== CLOSE TICKET =====
        document.querySelectorAll('.ticket-actions .close').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (confirm('Are you sure you want to close this ticket?')) {
                    alert('Ticket closed. 🎫');
                }
            });
        });

        // ===== STATUS BADGE CLICK =====
        document.querySelector('.status-badge').addEventListener('click', function() {
            alert('🟢 Sentinal is currently ONLINE and operational.\nAll systems running smoothly.');
        });
    </script>
</body>
</html>
