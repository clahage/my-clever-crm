<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Take our free 60-second credit assessment quiz. Find out how much your credit score could improve with expert help. No cost, no obligation.">
<meta name="keywords" content="Credit Assessment, Credit Score Quiz, Free Credit Review, Credit Repair Quiz, Huntington Beach">
<meta name="author" content="Speedy Credit Repair">
<meta property="og:title" content="Free Credit Assessment - How Much Could Your Score Improve?">
<meta property="og:description" content="Take our 60-second quiz and get a personalized AI credit assessment. No cost, no obligation.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://speedycreditrepair.com/quiz">
<title>Free Credit Assessment Quiz - Speedy Credit Repair | A+ BBB Rating Since 1995</title>
<link rel="stylesheet" type="text/css" href="https://speedycreditrepair.com/template/stylesheet.css" />
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
<style>
/* ═══════════════════════════════════════════════════════════════
   QUIZ PAGE STYLES
   © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
   ═══════════════════════════════════════════════════════════════ */

/* Quiz Container */
.quiz-wrapper {
	max-width: 680px;
	margin: 0 auto;
	padding: 0 16px;
}
.quiz-card {
	background: rgba(255,255,255,0.97);
	border-radius: 12px;
	padding: 40px 36px;
	box-shadow: 0 8px 32px rgba(0,0,0,0.12);
	position: relative;
	overflow: hidden;
}
.quiz-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 4px;
	background: linear-gradient(90deg, #090 0%, #00cc00 100%);
}

/* Progress Bar */
.progress-bar-container {
	margin-bottom: 32px;
}
.progress-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
	font-size: 13px;
	color: #888;
	font-weight: 500;
}
.progress-track {
	height: 8px;
	background: #e8e8e8;
	border-radius: 4px;
	overflow: hidden;
}
.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #090 0%, #00cc00 100%);
	border-radius: 4px;
	transition: width 0.5s ease;
	width: 0%;
}

/* Steps */
.quiz-step {
	display: none;
	animation: fadeIn 0.4s ease;
}
.quiz-step.active {
	display: block;
}
@keyframes fadeIn {
	from { opacity: 0; transform: translateY(12px); }
	to { opacity: 1; transform: translateY(0); }
}

/* Question Styling */
.quiz-step h2 {
	font-size: 24px;
	color: #222;
	margin: 0 0 8px 0;
	line-height: 1.3;
}
.quiz-step .step-subtitle {
	font-size: 14px;
	color: #888;
	margin: 0 0 28px 0;
}

/* Option Cards */
.options-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
	margin-bottom: 8px;
}
.option-card {
	border: 2px solid #e0e0e0;
	border-radius: 10px;
	padding: 18px 16px;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: center;
	background: #fff;
}
.option-card:hover {
	border-color: #090;
	background: #f0fff0;
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0,153,0,0.12);
}
.option-card.selected {
	border-color: #090;
	background: #e6ffe6;
	box-shadow: 0 0 0 1px #090;
}
.option-card .option-icon {
	font-size: 28px;
	display: block;
	margin-bottom: 8px;
}
.option-card .option-label {
	font-size: 14px;
	font-weight: 600;
	color: #333;
	display: block;
}

/* Multi-select (Q3) */
.options-grid.multi .option-card.selected::after {
	content: '✓';
	position: absolute;
	top: 8px;
	right: 10px;
	color: #090;
	font-weight: bold;
	font-size: 16px;
}
.options-grid.multi .option-card {
	position: relative;
}
.multi-hint {
	font-size: 12px;
	color: #aaa;
	text-align: center;
	margin-top: 4px;
	margin-bottom: 0;
}

/* Navigation Buttons */
.quiz-nav {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 28px;
}
.btn-back {
	background: none;
	border: none;
	color: #888;
	font-size: 14px;
	cursor: pointer;
	padding: 10px 16px;
	font-family: Roboto, sans-serif;
	transition: color 0.2s;
}
.btn-back:hover {
	color: #333;
}
.btn-next {
	padding: 14px 36px;
	background: linear-gradient(135deg, #090 0%, #006600 100%);
	color: white;
	border: none;
	border-radius: 6px;
	font-size: 15px;
	font-weight: bold;
	cursor: pointer;
	transition: transform 0.2s, box-shadow 0.2s;
	font-family: Roboto, sans-serif;
}
.btn-next:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 16px rgba(0,153,0,0.3);
}
.btn-next:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none;
	box-shadow: none;
}

/* Lead Capture Form (Step 4) */
.capture-form .form-group {
	margin-bottom: 16px;
}
.capture-form .form-group label {
	display: block;
	margin-bottom: 6px;
	color: #333;
	font-weight: 500;
	font-size: 14px;
}
.capture-form .form-group input {
	width: 100%;
	padding: 12px;
	border: 2px solid #ddd;
	border-radius: 6px;
	font-size: 15px;
	font-family: Roboto, sans-serif;
	box-sizing: border-box;
	transition: border-color 0.3s;
}
.capture-form .form-group input:focus {
	outline: none;
	border-color: #090;
}
.capture-form .form-group small {
	color: #999;
	font-size: 12px;
	display: block;
	margin-top: 4px;
}
.required { color: #d32f2f; }
.consent-group { margin-bottom: 12px; }
.consent-label {
	display: flex;
	align-items: flex-start;
	gap: 10px;
	cursor: pointer;
}
.consent-label input[type="checkbox"] {
	margin-top: 3px;
	min-width: 18px;
	min-height: 18px;
	accent-color: #090;
	cursor: pointer;
}
.consent-text {
	font-size: 12px;
	color: #666;
	line-height: 1.5;
}
.consent-text a { color: #090; text-decoration: underline; }
.lock-note {
	text-align: center;
	font-size: 12px;
	color: #aaa;
	margin-top: 12px;
}

/* Results Section (Step 5) */
.results-loading {
	text-align: center;
	padding: 60px 20px;
}
.results-loading .spinner {
	width: 48px;
	height: 48px;
	border: 4px solid #e0e0e0;
	border-top: 4px solid #090;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto 20px;
}
@keyframes spin {
	to { transform: rotate(360deg); }
}
.results-loading p {
	color: #666;
	font-size: 15px;
}

.results-content {
	display: none;
}
.results-content.show {
	display: block;
	animation: fadeIn 0.6s ease;
}
.result-headline {
	font-size: 26px;
	color: #090;
	margin: 0 0 24px 0;
	text-align: center;
	line-height: 1.3;
}
.result-section {
	margin-bottom: 20px;
	padding: 16px 20px;
	background: #f8faf8;
	border-radius: 8px;
	border-left: 3px solid #090;
}
.result-section h4 {
	font-size: 14px;
	color: #090;
	margin: 0 0 8px 0;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}
.result-section p {
	font-size: 14px;
	color: #444;
	margin: 0;
	line-height: 1.6;
}
.result-recommendations {
	margin-bottom: 20px;
}
.result-recommendations h4 {
	font-size: 14px;
	color: #090;
	margin: 0 0 12px 0;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}
.rec-item {
	display: flex;
	align-items: flex-start;
	gap: 10px;
	margin-bottom: 10px;
	font-size: 14px;
	color: #444;
	line-height: 1.5;
}
.rec-item .rec-num {
	background: #090;
	color: #fff;
	width: 22px;
	height: 22px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: bold;
	flex-shrink: 0;
	margin-top: 1px;
}
.result-timeline {
	text-align: center;
	padding: 16px;
	background: linear-gradient(135deg, #e6ffe6 0%, #f0fff0 100%);
	border-radius: 8px;
	margin-bottom: 20px;
}
.result-timeline .timeline-label {
	font-size: 12px;
	color: #666;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}
.result-timeline .timeline-value {
	font-size: 20px;
	font-weight: bold;
	color: #090;
	margin-top: 4px;
}
.result-urgency {
	text-align: center;
	font-size: 13px;
	color: #d32f2f;
	font-weight: 500;
	margin-bottom: 24px;
}
.cta-enroll {
	display: block;
	width: 100%;
	padding: 18px;
	background: linear-gradient(135deg, #090 0%, #006600 100%);
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 18px;
	font-weight: bold;
	cursor: pointer;
	transition: transform 0.2s, box-shadow 0.2s;
	font-family: Roboto, sans-serif;
	text-align: center;
	text-decoration: none;
	box-sizing: border-box;
}
.cta-enroll:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 24px rgba(0,153,0,0.3);
	color: white;
}
.cta-secondary {
	display: block;
	text-align: center;
	margin-top: 12px;
	font-size: 14px;
	color: #090;
}

/* Trust Bar */
.quiz-trust {
	display: flex;
	gap: 16px;
	margin-top: 28px;
	padding-top: 20px;
	border-top: 1px solid #eee;
	font-size: 13px;
	color: #888;
	flex-wrap: wrap;
	justify-content: center;
}
.quiz-trust div {
	text-align: center;
}
.quiz-trust span {
	display: block;
	font-size: 18px;
	margin-bottom: 2px;
}

/* Intro Banner — sits inside #banner which has background-color:#fff from stylesheet.css */
/* So text must be DARK, not white. Using same colors as landing page banner text. */
.quiz-intro-banner {
	text-align: center;
	padding: 30px 0 10px 0;
}
.quiz-intro-banner h1 {
	font-size: 28px;
	color: #333;
	margin: 0 0 8px 0;
	font-weight: 700;
}
.quiz-intro-banner p {
	font-size: 16px;
	color: #090;
	margin: 0;
	font-weight: 600;
}

/* Mobile Responsive */
@media (max-width: 600px) {
	.quiz-card { padding: 28px 20px; }
	.quiz-step h2 { font-size: 20px; }
	.options-grid { grid-template-columns: 1fr; }
	.result-headline { font-size: 22px; }
	.quiz-intro-banner h1 { font-size: 22px; }
}
</style>
</head>
<body>
	<div id="pre-header">
	<div class="container">
		<div class="left">
			<a href="https://www.google.com/maps/place/Speedy+Credit+Repair+Inc./@33.6576776,-118.0428509,13z/data=!4m12!1m2!2m1!1sspeedy!3m8!1s0x80dd21395f6b5179:0xa94be3d91e8d8fab!8m2!3d33.6576845!4d-118.0016512!9m1!1b1!15sCgZzcGVlZHmSARRmaW5hbmNpYWxfY29uc3VsdGFudOABAA!16s%2Fg%2F1hm3qxddw?entry=ttu" target="_blank" alt="View Our Location">
				<span class="no-mobile" style="background-image:url(https://speedycreditrepair.com/template/images/icon01.png);">
					117 Main St # 202
					<br />
					Huntington Beach, CA 92648
				</span>
			</a>
			<a href="tel:+18887247344" target="_blank" alt="View Our Hours">
				<span class="no-mobile" style="background-image:url(https://speedycreditrepair.com/template/images/icon02.png);">
					Open 7 Days A Week
					<br />
					Available 24 Hours
				</span>
			</a>
			<a href="tel:+18887247344" alt="View Our Contact Methods">
				<span style="background-image:url(https://speedycreditrepair.com/template/images/icon03.png);">
					1-888-724-7344
					<br />
					Ask For A Free Credit Review
				</span>
			</a>
		</div>
		<ul class="right">
			<li style="background-image:url(https://speedycreditrepair.com/template/images/icon_user.png);">
				<a href="/account/sign-in"><p>Sign In</p></a>			</li>
			</a>
		</ul>
	</div>
</div>
<div id="header">
	<div class="container">
		<a class="logo" href="https://speedycreditrepair.com">
			<img src="https://speedycreditrepair.com/template/images/logo.png" width="320px" height="auto" alt="Speedy Credit Repair, Inc." />
		</a>
		<button class="mobile-menu-0"></button>
		<button class="mobile-menu-1"></button>
		<ul id="navigation" class="top-level-menu">
			<li><a href="https://speedycreditrepair.com/index" alt="Homepage">Home</a></li>
			<li><a href="https://speedycreditrepair.com/how-it-works" alt="How It Works">How It Works</a></li>
			<li>
				<a href="https://speedycreditrepair.com/build-your-credit" alt="Build Your Credit">Build Your Credit</a>
				<ul class="second-level-menu">
					<li><a href="https://speedycreditrepair.com/build-your-credit/rental-reporting" alt="Rental Reporting">Rental Reporting</a></li>
					<li><a href="https://speedycreditrepair.com/build-your-credit/secured-cards" alt="Secured Cards">Secured Cards</a></li>
					<li><a href="https://speedycreditrepair.com/build-your-credit/unsecured-cards" alt="Unsecured Cards">Unsecured Cards</a></li>
					<li><a href="https://speedycreditrepair.com/build-your-credit/auto-loans" alt="Auto Loans">Auto Loans</a></li>
					<li><a href="https://speedycreditrepair.com/build-your-credit/loans" alt="Loans">Loans</a></li>
				</ul>
			</li>
			<li>
				<a href="https://speedycreditrepair.com/reviews" alt="Reviews">Reviews</a>
				<ul class="second-level-menu">
					<li><a target="_blank" href="https://www.yelp.com/biz/speedy-credit-repair-huntington-beach-2#reviews" alt="Yelp Reviews">Yelp Reviews</a></li>
					<li><a target="_blank" href="https://www.google.com/maps/place/Speedy+Credit+Repair+Inc./@33.6576776,-118.0428509,13z/data=!4m12!1m2!2m1!1sspeedy!3m8!1s0x80dd21395f6b5179:0xa94be3d91e8d8fab!8m2!3d33.6576845!4d-118.0016512!9m1!1b1!15sCgZzcGVlZHmSARRmaW5hbmNpYWxfY29uc3VsdGFudOABAA!16s%2Fg%2F1hm3qxddw?entry=ttu" alt="Google Reviews">Google Reviews</a></li>
					<li><a target="_blank" href="https://www.yellowpages.com/huntington-beach-ca/mip/speedy-credit-repair-inc-519760802" alt="Yellow Pages Reviews">Yellow Pages Reviews</a></li>
					<li><a target="_blank" href="https://www.facebook.com/speedycreditrepairservices" alt="Facebook Reviews">Facebook Reviews</a></li>
				</ul>
			</li>
			<li>
				<a href="https://speedycreditrepair.com/education" alt="Education">Education</a>
				<ul class="second-level-menu">
					<li><a href="https://speedycreditrepair.com/education/blog" alt="Blog">Blog</a></li>
					<li><a href="https://speedycreditrepair.com/education/faq" alt="FAQ">FAQ</a></li>
				</ul>
			</li>
			<li><a href="https://speedycreditrepair.com/about-us" alt="About Us">About Us</a></li>
		</ul>
	</div>
</div>
<div id="spacer"></div>

	<!-- ===== BANNER SECTION ===== -->
	<div id="banner">
		<div class="container">
			<div class="quiz-intro-banner">
				<h1>How Much Could Your Credit Score Improve?</h1>
				<p>Take our free 60-second assessment and find out</p>
			</div>
		</div>
	</div>

	<!-- ===== QUIZ SECTION ===== -->
	<div style="background:#f5f5f5; padding:40px 0 60px 0;">
		<div class="quiz-wrapper">
			<div class="quiz-card">
				
				<!-- Progress Bar -->
				<div class="progress-bar-container">
					<div class="progress-header">
						<span id="stepLabel">Question 1 of 3</span>
						<span id="stepPercent">0%</span>
					</div>
					<div class="progress-track">
						<div class="progress-fill" id="progressFill"></div>
					</div>
				</div>
				
				<!-- ═══════ STEP 1: Credit Goal ═══════ -->
				<div class="quiz-step active" id="step1">
					<h2>What's your #1 credit goal?</h2>
					<p class="step-subtitle">This helps us personalize your assessment</p>
					
					<div class="options-grid" data-step="1">
						<div class="option-card" data-value="Buy a home">
							<span class="option-icon">🏠</span>
							<span class="option-label">Buy a Home</span>
						</div>
						<div class="option-card" data-value="Get a car or auto loan">
							<span class="option-icon">🚗</span>
							<span class="option-label">Get a Car / Auto Loan</span>
						</div>
						<div class="option-card" data-value="Lower my interest rates">
							<span class="option-icon">📉</span>
							<span class="option-label">Lower Interest Rates</span>
						</div>
						<div class="option-card" data-value="General score improvement">
							<span class="option-icon">📈</span>
							<span class="option-label">Improve My Score</span>
						</div>
					</div>
					
					<div class="quiz-nav">
						<div></div>
						<button class="btn-next" id="btn1" disabled>Next →</button>
					</div>
				</div>
				
				<!-- ═══════ STEP 2: Score Range ═══════ -->
				<div class="quiz-step" id="step2">
					<h2>What's your approximate credit score?</h2>
					<p class="step-subtitle">Your best guess is fine — we'll verify later</p>
					
					<div class="options-grid" data-step="2">
						<div class="option-card" data-value="Below 500 (Poor)">
							<span class="option-icon">🔴</span>
							<span class="option-label">Below 500</span>
						</div>
						<div class="option-card" data-value="500-579 (Very Low)">
							<span class="option-icon">🟠</span>
							<span class="option-label">500 – 579</span>
						</div>
						<div class="option-card" data-value="580-669 (Fair)">
							<span class="option-icon">🟡</span>
							<span class="option-label">580 – 669</span>
						</div>
						<div class="option-card" data-value="670+ (Good but want better)">
							<span class="option-icon">🟢</span>
							<span class="option-label">670+</span>
						</div>
					</div>
					
					<!-- Extra option for "I don't know" -->
					<div class="options-grid" data-step="2" style="grid-template-columns:1fr; max-width:320px; margin:12px auto 0;">
						<div class="option-card" data-value="I don't know my score">
							<span class="option-icon">❓</span>
							<span class="option-label">I Don't Know</span>
						</div>
					</div>
					
					<div class="quiz-nav">
						<button class="btn-back" id="back2">← Back</button>
						<button class="btn-next" id="btn2" disabled>Next →</button>
					</div>
				</div>
				
				<!-- ═══════ STEP 3: Negative Items (Multi-Select) ═══════ -->
				<div class="quiz-step" id="step3">
					<h2>What negative items are on your report?</h2>
					<p class="step-subtitle">Select all that apply — or your best guess</p>
					
					<div class="options-grid multi" data-step="3">
						<div class="option-card" data-value="Collections / Charge-offs">
							<span class="option-icon">📋</span>
							<span class="option-label">Collections / Charge-offs</span>
						</div>
						<div class="option-card" data-value="Late Payments">
							<span class="option-icon">⏰</span>
							<span class="option-label">Late Payments</span>
						</div>
						<div class="option-card" data-value="High Credit Card Balances">
							<span class="option-icon">💳</span>
							<span class="option-label">High Balances</span>
						</div>
						<div class="option-card" data-value="Bankruptcy / Public Records">
							<span class="option-icon">⚖️</span>
							<span class="option-label">Bankruptcy / Public Records</span>
						</div>
					</div>
					<div class="options-grid multi" data-step="3" style="grid-template-columns:1fr; max-width:320px; margin:12px auto 0;">
						<div class="option-card" data-value="I'm not sure">
							<span class="option-icon">🤷</span>
							<span class="option-label">I'm Not Sure</span>
						</div>
					</div>
					<p class="multi-hint">Select one or more</p>
					
					<div class="quiz-nav">
						<button class="btn-back" id="back3">← Back</button>
						<button class="btn-next" id="btn3" disabled>See My Results →</button>
					</div>
				</div>
				
				<!-- ═══════ STEP 4: Lead Capture ═══════ -->
				<div class="quiz-step" id="step4">
					<h2>Almost there! Where should we send your results?</h2>
					<p class="step-subtitle">Your personalized AI credit assessment is ready — we just need to know where to send it</p>
					
					<div class="capture-form">
						<div class="form-group">
							<label for="firstName">First Name <span class="required">*</span></label>
							<input type="text" id="firstName" name="firstName" placeholder="John" required autocomplete="given-name">
						</div>
						<div class="form-group">
							<label for="lastName">Last Name <span class="required">*</span></label>
							<input type="text" id="lastName" name="lastName" placeholder="Smith" required autocomplete="family-name">
						</div>
						<div class="form-group">
							<label for="email">Email Address <span class="required">*</span></label>
							<input type="email" id="email" name="email" placeholder="john@example.com" required autocomplete="email">
						</div>
						<div class="form-group">
							<label for="phone">Phone Number <span class="required">*</span></label>
							<input type="tel" id="phone" name="phone" placeholder="(555) 123-4567" required autocomplete="off" inputmode="numeric">
							<small>Please type your 10-digit phone number manually</small>
						</div>
						
						<!-- SMS Consent (TCPA Compliance) -->
						<div class="form-group consent-group">
							<label class="consent-label">
								<input type="checkbox" id="smsConsent" name="smsConsent">
								<span class="consent-text">
									I consent to receive text messages from 
									Speedy Credit Repair regarding my credit assessment. Msg &amp; data 
									rates may apply. Reply STOP to opt out. 
									<a href="https://speedycreditrepair.com/privacy" target="_blank">Privacy Policy</a>
								</span>
							</label>
						</div>
						
						<button class="btn-next" id="btnSubmit" style="width:100%;" disabled>
							🔍 Get My Free Assessment
						</button>
						<p class="lock-note">🔒 Your information is 100% secure and never shared</p>
					</div>
					
					<div class="quiz-nav">
						<button class="btn-back" id="back4">← Back</button>
						<div></div>
					</div>
				</div>
				
				<!-- ═══════ STEP 5: Results ═══════ -->
				<div class="quiz-step" id="step5">
					<!-- Loading State -->
					<div class="results-loading" id="resultsLoading">
						<div class="spinner"></div>
						<p>Analyzing your credit profile with AI...</p>
						<p style="font-size:12px; color:#aaa;">This takes about 5 seconds</p>
					</div>
					
					<!-- Results Content (hidden until loaded) -->
					<div class="results-content" id="resultsContent">
						<h2 class="result-headline" id="resultHeadline"></h2>
						
						<div class="result-section" id="resultSituation">
							<h4>Your Current Situation</h4>
							<p id="resultSituationText"></p>
						</div>
						
						<div class="result-section" id="resultGoal">
							<h4>Your Goal Analysis</h4>
							<p id="resultGoalText"></p>
						</div>
						
						<div class="result-section" id="resultImpact">
							<h4>Estimated Impact</h4>
							<p id="resultImpactText"></p>
						</div>
						
						<div class="result-recommendations" id="resultRecs">
							<h4>Our Top 3 Recommendations</h4>
							<div id="resultRecsList"></div>
						</div>
						
						<div class="result-timeline">
							<div class="timeline-label">Estimated Timeline</div>
							<div class="timeline-value" id="resultTimeline"></div>
						</div>
						
						<p class="result-urgency" id="resultUrgency"></p>
						
						<a class="cta-enroll" id="ctaEnroll" href="#">
							🚀 Start My Free Full Credit Review
						</a>
						<a class="cta-secondary" href="tel:+18887247344">
							Or call us: 1-888-724-7344 (available 24/7)
						</a>
					</div>
				</div>
				
				<!-- Trust Indicators -->
				<div class="quiz-trust">
					<div>
						<span>⭐</span>
						A+ BBB Since 1995
					</div>
					<div>
						<span>🔒</span>
						100% Secure
					</div>
					<div>
						<span>🆓</span>
						No Cost / No Obligation
					</div>
					<div>
						<span>⏱️</span>
						Takes 60 Seconds
					</div>
				</div>
			</div>
		</div>
	</div>

	<div id="branding">
		<div class="container">
			<div class="c100">
				<div class="reviews">
					<a href="https://www.yelp.com/biz/speedy-credit-repair-huntington-beach-2#reviews" target="_blank" aria-label="View Our Yelp Reviews!">

<!-- ===== JAVASCRIPT ===== -->
<script>
/**
 * Quiz Page → Firebase Integration
 * © 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage | All Rights Reserved
 *
 * Flow:
 * 1. Three quiz questions (no personal info)
 * 2. Lead capture form (name, email, phone)
 * 3. captureWebLead → creates/updates contact
 * 4. aiContentGenerator → generates AI assessment
 * 5. Display results + CTA to enroll
 */
document.addEventListener('DOMContentLoaded', function() {
	
	// ═══════════════════════════════════════════════════════════════
	// STATE
	// ═══════════════════════════════════════════════════════════════
	let currentStep = 1;
	const totalSteps = 5;
	const answers = {
		creditGoal: null,
		scoreRange: null,
		negativeItems: []
	};
	
	// ═══════════════════════════════════════════════════════════════
	// PROGRESS BAR
	// ═══════════════════════════════════════════════════════════════
	function updateProgress() {
		// Steps 1-3 = questions, step 4 = capture, step 5 = results
		let percent = 0;
		if (currentStep === 1) percent = 0;
		else if (currentStep === 2) percent = 33;
		else if (currentStep === 3) percent = 66;
		else if (currentStep === 4) percent = 85;
		else if (currentStep === 5) percent = 100;
		
		document.getElementById('progressFill').style.width = percent + '%';
		document.getElementById('stepPercent').textContent = percent + '%';
		
		if (currentStep <= 3) {
			document.getElementById('stepLabel').textContent = 'Question ' + currentStep + ' of 3';
		} else if (currentStep === 4) {
			document.getElementById('stepLabel').textContent = 'Final Step';
		} else {
			document.getElementById('stepLabel').textContent = 'Your Results';
		}
	}
	
	// ═══════════════════════════════════════════════════════════════
	// STEP NAVIGATION
	// ═══════════════════════════════════════════════════════════════
	function goToStep(step) {
		// Hide all steps
		document.querySelectorAll('.quiz-step').forEach(function(el) {
			el.classList.remove('active');
		});
		// Show target step
		currentStep = step;
		document.getElementById('step' + step).classList.add('active');
		updateProgress();
		
		// Scroll quiz card into view smoothly
		document.querySelector('.quiz-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
	
	// ═══════════════════════════════════════════════════════════════
	// OPTION CARD SELECTION — SINGLE SELECT (Steps 1 & 2)
	// ═══════════════════════════════════════════════════════════════
	document.querySelectorAll('.options-grid:not(.multi) .option-card').forEach(function(card) {
		card.addEventListener('click', function() {
			var step = this.closest('.quiz-step').id.replace('step', '');
			var value = this.getAttribute('data-value');
			
			// Deselect all in this step (across all grids in the step)
			var stepEl = this.closest('.quiz-step');
			stepEl.querySelectorAll('.option-card').forEach(function(c) {
				c.classList.remove('selected');
			});
			
			// Select this one
			this.classList.add('selected');
			
			// Store answer
			if (step === '1') answers.creditGoal = value;
			if (step === '2') answers.scoreRange = value;
			
			// Enable next button
			document.getElementById('btn' + step).disabled = false;
		});
	});
	
	// ═══════════════════════════════════════════════════════════════
	// OPTION CARD SELECTION — MULTI SELECT (Step 3)
	// ═══════════════════════════════════════════════════════════════
	document.querySelectorAll('.options-grid.multi .option-card').forEach(function(card) {
		card.addEventListener('click', function() {
			var value = this.getAttribute('data-value');
			
			// "I'm not sure" is exclusive — deselect others if selected
			if (value === "I'm not sure") {
				document.querySelectorAll('.options-grid.multi .option-card').forEach(function(c) {
					c.classList.remove('selected');
				});
				this.classList.add('selected');
				answers.negativeItems = [value];
			} else {
				// Deselect "I'm not sure" if another option is clicked
				document.querySelectorAll('.options-grid.multi .option-card').forEach(function(c) {
					if (c.getAttribute('data-value') === "I'm not sure") {
						c.classList.remove('selected');
					}
				});
				
				// Toggle this selection
				this.classList.toggle('selected');
				
				// Rebuild array from selected items
				answers.negativeItems = [];
				document.querySelectorAll('.options-grid.multi .option-card.selected').forEach(function(c) {
					answers.negativeItems.push(c.getAttribute('data-value'));
				});
			}
			
			// Enable next if at least one selected
			document.getElementById('btn3').disabled = answers.negativeItems.length === 0;
		});
	});
	
	// ═══════════════════════════════════════════════════════════════
	// NAVIGATION BUTTONS
	// ═══════════════════════════════════════════════════════════════
	document.getElementById('btn1').addEventListener('click', function() { goToStep(2); });
	document.getElementById('btn2').addEventListener('click', function() { goToStep(3); });
	document.getElementById('btn3').addEventListener('click', function() { goToStep(4); });
	
	document.getElementById('back2').addEventListener('click', function() { goToStep(1); });
	document.getElementById('back3').addEventListener('click', function() { goToStep(2); });
	document.getElementById('back4').addEventListener('click', function() { goToStep(3); });
	
	// ═══════════════════════════════════════════════════════════════
	// PHONE AUTO-FORMAT (deletion-friendly)
	// ═══════════════════════════════════════════════════════════════
	var phoneInput = document.getElementById('phone');
	var lastPhoneLength = 0;
	
	phoneInput.addEventListener('input', function(e) {
		var raw = e.target.value.replace(/\D/g, '');
		
		// If user is deleting, don't reformat — let them delete freely
		if (e.target.value.length < lastPhoneLength) {
			lastPhoneLength = e.target.value.length;
			validateCaptureForm();
			return;
		}
		
		if (raw.length > 10) raw = raw.slice(0, 10);
		
		var formatted = '';
		if (raw.length >= 7) {
			formatted = '(' + raw.slice(0,3) + ') ' + raw.slice(3,6) + '-' + raw.slice(6);
		} else if (raw.length >= 4) {
			formatted = '(' + raw.slice(0,3) + ') ' + raw.slice(3);
		} else if (raw.length >= 1) {
			formatted = '(' + raw;
		}
		
		e.target.value = formatted;
		lastPhoneLength = formatted.length;
		validateCaptureForm();
	});
	
	// Clear if browser auto-filled junk
	phoneInput.addEventListener('focus', function() {
		var raw = phoneInput.value.replace(/\D/g, '');
		if (raw.length > 10) {
			phoneInput.value = '';
			lastPhoneLength = 0;
		}
	});
	
	// ═══════════════════════════════════════════════════════════════
	// FORM VALIDATION
	// ═══════════════════════════════════════════════════════════════
	var captureInputs = document.querySelectorAll('#step4 input[type="text"], #step4 input[type="email"], #step4 input[type="tel"]');
	captureInputs.forEach(function(input) {
		input.addEventListener('input', validateCaptureForm);
	});
	
	function validateCaptureForm() {
		var firstName = document.getElementById('firstName').value.trim();
		var lastName = document.getElementById('lastName').value.trim();
		var email = document.getElementById('email').value.trim();
		var phone = document.getElementById('phone').value.replace(/\D/g, '');
		
		var valid = firstName.length > 0 && lastName.length > 0 && 
			email.includes('@') && email.includes('.') && phone.length === 10;
		
		document.getElementById('btnSubmit').disabled = !valid;
	}
	
	// ═══════════════════════════════════════════════════════════════
	// FORM SUBMIT → CAPTURE LEAD + GENERATE ASSESSMENT
	// ═══════════════════════════════════════════════════════════════
	document.getElementById('btnSubmit').addEventListener('click', async function() {
		var btn = this;
		btn.disabled = true;
		btn.innerHTML = '⏳ Generating your assessment...';
		
		var formData = {
			firstName: document.getElementById('firstName').value.trim(),
			lastName: document.getElementById('lastName').value.trim(),
			email: document.getElementById('email').value.trim().toLowerCase(),
			phone: document.getElementById('phone').value.replace(/\D/g, ''),
			smsConsent: document.getElementById('smsConsent').checked
		};
		
		// Show results step with loading spinner
		goToStep(5);
		
		try {
			// ─── STEP A: Capture lead via captureWebLead ──────────────
			console.log('📤 Capturing lead...');
			var captureResponse = await fetch('https://us-central1-my-clever-crm.cloudfunctions.net/operationsManager', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'captureWebLead',
					firstName: formData.firstName,
					lastName: formData.lastName,
					email: formData.email,
					phone: formData.phone,
					smsConsent: formData.smsConsent,
					smsConsentTimestamp: new Date().toISOString(),
					leadSource: 'quiz',
					creditGoal: answers.creditGoal
				})
			});
			
			var captureResult = await captureResponse.json();
			console.log('✅ Lead captured:', captureResult);
			
			if (!captureResult.success) {
				throw new Error(captureResult.error || 'Failed to capture lead');
			}
			
			// Store for enrollment CTA
			var contactId = captureResult.contactId;
			var enrollToken = captureResult.token;
			
			// ─── STEP B: Generate AI Assessment ──────────────────────
			console.log('🤖 Generating AI assessment...');
			var aiResponse = await fetch('https://us-central1-my-clever-crm.cloudfunctions.net/aiContentGenerator', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					data: {
						type: 'generateQuizAssessment',
						firstName: formData.firstName,
						creditGoal: answers.creditGoal,
						scoreRange: answers.scoreRange,
						negativeItems: answers.negativeItems
					}
				})
			});
			
			var aiResult = await aiResponse.json();
			console.log('✅ AI assessment:', aiResult);
			
			// The callable function wraps the return in a `result` key
			var assessment = aiResult.result ? aiResult.result.assessment : aiResult.assessment;
			
			if (!assessment) {
				throw new Error('No assessment data returned');
			}
			
			// ─── STEP C: Display Results ─────────────────────────────
			displayResults(assessment, contactId, enrollToken);
			
		} catch (error) {
			console.error('❌ Error:', error);
			
			// Show a friendly fallback
			displayResults({
				headline: formData.firstName + ', we have great news!',
				currentSituation: 'Based on your responses, professional credit repair could make a real difference in your situation. Many people in a similar position have seen significant improvements.',
				goalAnalysis: 'Your goal of "' + answers.creditGoal + '" is achievable with the right strategy. We\'ll help you understand exactly what steps to take.',
				estimatedImpact: 'Our clients typically see improvements of 50-150 points within the first 3-6 months.',
				topRecommendations: [
					'Get a complete 3-bureau credit report to identify all disputable items',
					'Address negative items strategically with expert guidance',
					'Build positive credit history while negatives are being removed'
				],
				estimatedTimeline: '45-90 days for initial improvements',
				urgencyNote: 'Every month you wait costs money in higher interest rates.'
			}, null, null);
		}
	});
	
	// ═══════════════════════════════════════════════════════════════
	// DISPLAY RESULTS
	// ═══════════════════════════════════════════════════════════════
	function displayResults(assessment, contactId, enrollToken) {
		// Populate results
		document.getElementById('resultHeadline').textContent = assessment.headline || 'Your assessment is ready!';
		document.getElementById('resultSituationText').textContent = assessment.currentSituation || '';
		document.getElementById('resultGoalText').textContent = assessment.goalAnalysis || '';
		document.getElementById('resultImpactText').textContent = assessment.estimatedImpact || '';
		document.getElementById('resultTimeline').textContent = assessment.estimatedTimeline || '45-90 days';
		document.getElementById('resultUrgency').textContent = assessment.urgencyNote || '';
		
		// Build recommendations list
		var recsHtml = '';
		var recs = assessment.topRecommendations || [];
		for (var i = 0; i < recs.length; i++) {
			recsHtml += '<div class="rec-item">' +
				'<span class="rec-num">' + (i + 1) + '</span>' +
				'<span>' + recs[i] + '</span>' +
				'</div>';
		}
		document.getElementById('resultRecsList').innerHTML = recsHtml;
		
		// Set enrollment CTA link
		var enrollUrl = 'https://myclevercrm.com/enroll';
		if (enrollToken && contactId) {
			enrollUrl += '?token=' + enrollToken + '&contactId=' + contactId;
		}
		document.getElementById('ctaEnroll').href = enrollUrl;
		
		// Hide loading, show results
		document.getElementById('resultsLoading').style.display = 'none';
		document.getElementById('resultsContent').classList.add('show');
	}
	
	// Initialize
	updateProgress();
});
</script>
</body>
</html>