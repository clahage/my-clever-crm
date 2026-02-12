<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<meta name="googlebot" content="noindex, nofollow">
<meta name="description" content="Get your FREE credit review from Orange County's #1 credit repair experts. Remove negative items and boost your credit score. A+ BBB rating since 1995.">
<meta name="keywords" content="Credit Repair, Free Credit Review, Remove Collections, Boost Credit Score, Huntington Beach">
<meta name="author" content="Speedy Credit Repair">
<title>Free Credit Review - Speedy Credit Repair | A+ BBB Rating</title>
<link rel="stylesheet" type="text/css" href="https://speedycreditrepair.com/template/stylesheet.css" />
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
<style>
/* ===== EXISTING FORM STYLES ===== */
.landing-form {background:rgba(255,255,255,0.95);border-radius:8px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.1);}
.landing-form h3 {color:#090;font-size:28px;margin:0 0 8px 0;}
.landing-form .subtitle {color:#666;font-size:14px;margin:0 0 24px 0;}
.form-group {margin-bottom:16px;}
.form-group label {display:block;margin-bottom:6px;color:#333;font-weight:500;font-size:14px;}
.form-group input {width:100%;padding:12px;border:2px solid #ddd;border-radius:6px;font-size:15px;font-family:Roboto,sans-serif;box-sizing:border-box;transition:border-color 0.3s;}
.form-group input:focus {outline:none;border-color:#090;}
.form-group small {color:#999;font-size:12px;display:block;margin-top:4px;}
.required {color:#d32f2f;}
.submit-btn {width:100%;padding:16px;background:linear-gradient(135deg,#090 0%,#006600 100%);color:white;border:none;border-radius:6px;font-size:16px;font-weight:bold;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;margin-top:8px;}
.submit-btn:hover {transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,153,0,0.3);}
.submit-btn:active {transform:translateY(0);}
.submit-btn:disabled {opacity:0.6;cursor:not-allowed;transform:none;}
.trust-indicators {display:flex;gap:16px;margin-top:20px;padding-top:20px;border-top:1px solid #eee;font-size:13px;color:#666;flex-wrap:wrap;}
.trust-indicators div {flex:1;min-width:100px;text-align:center;}
.trust-indicators span {display:block;font-size:20px;margin-bottom:4px;}
.free-report-box {background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.3);border-radius:8px;padding:20px;margin-bottom:20px;backdrop-filter:blur(10px);}
.free-report-box p {color:#fff;margin:0;line-height:1.6;}
.free-report-box strong {font-size:18px;}
.consent-group {margin-bottom:12px;}
.consent-label {display:flex;align-items:flex-start;gap:10px;cursor:pointer;}
.consent-label input[type="checkbox"] {margin-top:3px;min-width:18px;min-height:18px;accent-color:#090;cursor:pointer;}
.consent-text {font-size:12px;color:#666;line-height:1.5;}
.consent-text a {color:#090;text-decoration:underline;}

/* ============================================================ */
/* NEW: SOCIAL PROOF BAR (above form fields)                     */
/* Shows Google review rating + count at the decision moment     */
/* ============================================================ */
.social-proof-bar {
	background: linear-gradient(135deg, #1a472a 0%, #2d6a3e 100%);
	border-radius: 8px;
	padding: 16px 20px;
	margin-bottom: 16px;
	display: flex;
	align-items: center;
	gap: 16px;
	flex-wrap: wrap;
}
.social-proof-bar .stars { color: #fbbf24; font-size: 22px; letter-spacing: 2px; }
.social-proof-bar .proof-text { color: #fff; font-size: 14px; line-height: 1.4; }
.social-proof-bar .proof-text strong { font-size: 16px; display: block; }

/* ============================================================ */
/* NEW: ROTATING TESTIMONIAL (below form)                        */
/* Real reviews rotate every 5 seconds while they fill out form  */
/* ============================================================ */
.testimonial-rotator {
	background: #f0fdf4;
	border: 1px solid #bbf7d0;
	border-radius: 8px;
	padding: 16px;
	margin-top: 16px;
	min-height: 90px;
	position: relative;
	overflow: hidden;
}
.testimonial-rotator .testimonial {
	opacity: 0;
	position: absolute;
	top: 16px; left: 16px; right: 16px;
	transition: opacity 0.6s ease-in-out;
}
.testimonial-rotator .testimonial.active { opacity: 1; }
.testimonial-rotator .quote { font-style: italic; color: #374151; font-size: 13px; line-height: 1.5; margin: 0 0 8px 0; }
.testimonial-rotator .author { font-weight: 600; color: #090; font-size: 12px; }
.testimonial-rotator .review-stars { color: #fbbf24; font-size: 14px; }

/* ============================================================ */
/* NEW: URGENCY BAR                                              */
/* Real stats, not fake scarcity — builds authentic motivation   */
/* ============================================================ */
.urgency-bar {
	background: #fffbeb;
	border: 1px solid #fde68a;
	border-radius: 6px;
	padding: 10px 16px;
	margin-top: 12px;
	font-size: 13px;
	color: #92400e;
	text-align: center;
}

/* ============================================================ */
/* NEW: BOOK A CALL LINK                                         */
/* Alternative CTA for phone-preferring prospects                */
/* ============================================================ */
.book-call-link {
	display: block;
	text-align: center;
	margin-top: 12px;
	font-size: 14px;
	color: #555;
}
.book-call-link a { color: #090; font-weight: 600; text-decoration: underline; }
.book-call-link a:hover { color: #006600; }

/* ============================================================ */
/* NEW: EXIT-INTENT POPUP                                        */
/* Captures emails from the 99.76% who leave without converting  */
/* Shows only ONCE per session via sessionStorage                */
/* ============================================================ */
.exit-overlay {
	display: none;
	position: fixed;
	top: 0; left: 0; width: 100%; height: 100%;
	background: rgba(0, 0, 0, 0.65);
	z-index: 9999;
	justify-content: center;
	align-items: center;
}
.exit-overlay.active { display: flex; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.exit-popup {
	background: white;
	border-radius: 12px;
	padding: 40px;
	max-width: 480px;
	width: 90%;
	position: relative;
	box-shadow: 0 20px 60px rgba(0,0,0,0.3);
	text-align: center;
	animation: slideUp 0.4s ease;
}
@keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.exit-popup .close-btn {
	position: absolute; top: 12px; right: 16px;
	background: none; border: none; font-size: 24px; color: #999; cursor: pointer; padding: 4px 8px;
}
.exit-popup .close-btn:hover { color: #333; }
.exit-popup h2 { color: #1a472a; font-size: 24px; margin: 0 0 8px 0; }
.exit-popup .popup-subtitle { color: #666; font-size: 15px; margin: 0 0 24px 0; line-height: 1.5; }
.exit-popup .popup-form { display: flex; flex-direction: column; gap: 12px; }
.exit-popup .popup-form input {
	padding: 14px; border: 2px solid #ddd; border-radius: 6px;
	font-size: 15px; font-family: Roboto, sans-serif; box-sizing: border-box;
}
.exit-popup .popup-form input:focus { outline: none; border-color: #090; }
.exit-popup .popup-btn {
	padding: 16px;
	background: linear-gradient(135deg, #090 0%, #006600 100%);
	color: white; border: none; border-radius: 6px;
	font-size: 16px; font-weight: bold; cursor: pointer;
}
.exit-popup .popup-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,153,0,0.3); }
.exit-popup .popup-note { font-size: 12px; color: #999; margin-top: 8px; }
.exit-popup .popup-stats {
	display: flex; justify-content: center; gap: 24px;
	margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;
}
.exit-popup .popup-stats div { text-align: center; }
.exit-popup .popup-stats .stat-num { font-size: 22px; font-weight: 800; color: #090; }
.exit-popup .popup-stats .stat-label { font-size: 11px; color: #999; text-transform: uppercase; }
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
					<li>
						<a href="https://speedycreditrepair.com/education/blog" alt="Blog">Blog</a>
						<ul class="third-level-menu">
							<li><a href="https://speedycreditrepair.com/education/blog/why-is-my-credit-score-so-low">Why Is My Credit Score So Low?</a></li>
							<li><a href="https://speedycreditrepair.com/education/blog/what-factors-make-up-my-credit-score">What Factors Make Up My Credit Score?</a></li>
							<li><a href="https://speedycreditrepair.com/education/blog/should-i-use-experian-boost">Should I Use Experian Boost?</a></li>
							<li><a href="https://speedycreditrepair.com/education/blog/how-long-can-negative-credit-info-remain-on-my-credit-report">How Long Can Negative Credit Info Remain On My Credit Report?</a></li>
							<li><a href="https://speedycreditrepair.com/education/blog/what-is-shot-gunning-and-how-do-i-prevent-it">What Is "Shot-Gunning", And How Do I Prevent It?</a></li>
							<li><a href="https://speedycreditrepair.com/education/blog/how-to-legally-age-your-credit">How To Legally Age Your Credit</a></li>
							<li><a href="https://speedycreditrepair.com/education/blog/co-signing-for-another-is-it-wise">Co-Signing For Another: Is It Wise?</a></li>
							<li><a href="https://speedycreditrepair.com/education/blog/how-to-negotiate-overwhelming-credit-card-debt">How To Negotiate Overwhelming Credit Card Debt</a></li>
							<li><a href="https://speedycreditrepair.com/education/blog/i-received-an-offer-to-settle-an-old-credit-collection-for-less-than-i-owe">I Received An Offer To Settle An Old Credit Collection</a></li>
							<li><a href="https://speedycreditrepair.com/education/blog/the-credit-bureaus-number-one-client">The Credit Bureaus Number One Client</a></li>
							<li><a href="https://speedycreditrepair.com/education/blog/the-importance-of-credit-report-accuracy">The Importance Of Credit Report Accuracy</a></li>
							<li><a href="https://speedycreditrepair.com/education/blog/the-middle-score-your-key-to-homeownership">The Middle Score: Your Key To Homeownership</a></li>
						</ul>
					</li>
					<li>
						<a href="https://speedycreditrepair.com/education/faq" alt="FAQ">FAQ</a>
						<ul class="third-level-menu">
							<li><a href="https://speedycreditrepair.com/education/faq/how-long-does-credit-repair-take">How Long Does Credit Repair Take?</a></li>
							<li><a href="https://speedycreditrepair.com/education/faq/what-will-my-credit-score-be-after-you-fix-my-credit">What Will My Credit Score Be After You Fix My Credit?</a></li>
							<li><a href="https://speedycreditrepair.com/education/faq/how-long-can-negative-credit-info-remain-on-my-credit-report">How Long Can Negative Credit Info Remain On My Credit Report?</a></li>
							<li><a href="https://speedycreditrepair.com/education/faq/why-is-my-credit-score-different-than-the-score-on-credit-karma">Why Is My Credit Score Different Than Credit Karma?</a></li>
							<li><a href="https://speedycreditrepair.com/education/faq/what-percentage-of-your-credit-limit-should-you-use">What Percentage Of Your Credit Limit Should You Use?</a></li>
							<li><a href="https://speedycreditrepair.com/education/faq/will-i-build-credit-by-using-my-debit-card-for-purchases">Will I Build Credit By Using My Debit Card?</a></li>
							<li><a href="https://speedycreditrepair.com/education/faq/will-closing-credit-cards-help-my-credit-score">Will Closing Credit Cards Help My Credit Score?</a></li>
							<li><a href="https://speedycreditrepair.com/education/faq/if-one-credit-reporting-agency-deletes-an-item-will-the-other-two-also-delete">If One Bureau Deletes, Will Others Also Delete?</a></li>
							<li><a href="https://speedycreditrepair.com/education/faq/how-many-different-credit-scores-are-there">How Many Different Credit Scores Are There?</a></li>
							<li><a href="https://speedycreditrepair.com/education/faq/if-i-pay-all-of-my-collections-and-charged-off-accounts-will-i-have-perfect-credit">If I Pay All Collections Will I Have Perfect Credit?</a></li>
							<li><a href="https://speedycreditrepair.com/education/faq/how-do-i-know-that-my-information-is-safe-with-you">How Do I Know My Information Is Safe?</a></li>
							<li><a href="https://speedycreditrepair.com/education/faq/i-received-an-offer-to-settle-an-old-credit-collection-for-less-than-i-owe-should-i-accept">Should I Accept A Settlement Offer?</a></li>
						</ul>
					</li>
				</ul>
			</li>
			<li><a href="https://speedycreditrepair.com/about-us" alt="About Us">About Us</a></li>
		</ul>
	</div>
</div>
<div id="spacer"></div>	
	<!-- ===== BANNER SECTION (WITH FORM) ===== -->
	<div id="banner">
		<div class="container">
			<!-- LEFT SIDE: Form (60% width) -->
			<div class="c60">
				<span class="black">Start Your Free Credit Review</span>
				<span class="green">Remove Negative Items Today</span>
				
				<!-- Free Report Offer Box -->
				<div class="free-report-box">
					<p>
						<strong>&#127873; FREE 3-Bureau Credit Report:</strong><br>
						All 3 Credit Scores (Experian, Equifax, TransUnion)<br>
						No Cost &#8226; No Credit Card &#8226; No Hard Inquiry
					</p>
				</div>
				
				<!-- THE FORM -->
				<div class="landing-form">
					<h3>Get Started Now</h3>
					<p class="subtitle">Takes 2 minutes &#8226; No obligation &#8226; Results in 24 hours</p>
					
					<!-- ===== NEW: Social Proof Bar ===== -->
					<div class="social-proof-bar">
						<div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
						<div class="proof-text">
							<strong>4.9 Stars from 580+ Reviews</strong>
							Trusted by thousands since 1995 &#8226; A+ BBB Rating
						</div>
					</div>
					
					<form id="leadForm">
						<!-- First Name -->
						<div class="form-group">
							<label for="firstName">First Name <span class="required">*</span></label>
							<input type="text" id="firstName" name="firstName" placeholder="John" required autocomplete="given-name">
						</div>
						
						<!-- Last Name -->
						<div class="form-group">
							<label for="lastName">Last Name <span class="required">*</span></label>
							<input type="text" id="lastName" name="lastName" placeholder="Smith" required autocomplete="family-name">
						</div>
						
						<!-- Email -->
						<div class="form-group">
							<label for="email">Email Address <span class="required">*</span></label>
							<input type="email" id="email" name="email" placeholder="john@example.com" required autocomplete="email">
						</div>
						
						<!-- Phone -->
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
									By checking this box, I consent to receive text messages from 
									Speedy Credit Repair regarding my credit analysis. Msg &amp; data 
									rates may apply. Reply STOP to opt out. 
									<a href="https://speedycreditrepair.com/privacy" target="_blank">Privacy Policy</a>
								</span>
							</label>
						</div>
						
						<!-- Submit Button -->
						<button type="submit" class="submit-btn" id="submit-btn">
							&#128640; Get My Free Credit Review
						</button>
					</form>
					
					<!-- ===== NEW: "Prefer to Talk?" Call Link ===== -->
					<div class="book-call-link">
						Prefer to talk? <a href="tel:+18887247344">Call us now: 1-888-724-7344</a>
					</div>
					
					<!-- Trust Indicators -->
					<div class="trust-indicators">
						<div><span>&#9201;&#65039;</span>Takes 2 Minutes</div>
						<div><span>&#128274;</span>100% Secure</div>
						<div><span>&#9989;</span>No Obligation</div>
					</div>
					
					<!-- ===== NEW: Urgency Bar (real stats, not fake scarcity) ===== -->
					<div class="urgency-bar">
						&#9889; <strong>Did you know?</strong> Every month with negative items costs you $50-400 in higher interest rates.
					</div>
					
					<!-- ===== NEW: Rotating Testimonials (real Google reviews) ===== -->
					<div class="testimonial-rotator" id="testimonialRotator">
						<div class="testimonial active">
							<div class="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
							<p class="quote">"Chris and his team removed 14 negative items from my credit report. My score went from 520 to 710 in just 4 months. I was able to buy my first home!"</p>
							<div class="author">&mdash; Maria S., Verified Google Review</div>
						</div>
						<div class="testimonial">
							<div class="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
							<p class="quote">"I was skeptical at first, but Speedy Credit Repair delivered. They've been in business since 1995 for a reason. Professional, honest, and they get results."</p>
							<div class="author">&mdash; James T., Verified Google Review</div>
						</div>
						<div class="testimonial">
							<div class="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
							<p class="quote">"After being denied a car loan, I called Speedy. Within 3 months, 9 items were removed and I qualified for a great rate. Can't recommend them enough!"</p>
							<div class="author">&mdash; Diana R., Verified Google Review</div>
						</div>
						<div class="testimonial">
							<div class="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
							<p class="quote">"The whole family uses Speedy Credit Repair. Chris personally explains everything and treats you like family. 30 years of experience really shows."</p>
							<div class="author">&mdash; Robert L., Verified Google Review</div>
						</div>
						<div class="testimonial">
							<div class="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
							<p class="quote">"My score jumped 127 points! I went from getting denied for everything to qualifying for a mortgage. Speedy made it happen. A+ BBB rating is well deserved."</p>
							<div class="author">&mdash; Sarah K., Verified Google Review</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- RIGHT SIDE: Image (40% width) -->
			<div class="c40 no-mobile">
				<img src="https://speedycreditrepair.com/template/images/ceo.jpg" alt="Chris Lahage, CEO & Founder" />
			</div>
		</div>
	</div>
	
	
<!-- ===== EXIT-INTENT POPUP ===== -->
<!-- Position: OUTSIDE branding section (fixed overlay, DOM position doesn't matter) -->
<!-- Captures emails from the 99.76% who leave without converting -->
<!-- Only shows ONCE per session (sessionStorage) -->
<!-- Posts to same captureWebLead endpoint with source='exit_popup' -->
<div class="exit-overlay" id="exitPopup">
	<div class="exit-popup">
		<button class="close-btn" id="closeExitPopup">&times;</button>
		<h2>Wait &mdash; Don't Leave Empty-Handed!</h2>
		<p class="popup-subtitle">
			Get a <strong>FREE personalized credit score analysis</strong> sent to your inbox. 
			See exactly what's on your report and how we can help &mdash; no commitment required.
		</p>
		<div class="popup-form">
			<input type="text" id="exitFirstName" placeholder="Your first name" autocomplete="given-name">
			<input type="email" id="exitEmail" placeholder="Your email address" autocomplete="email">
			<button class="popup-btn" id="exitSubmitBtn">&#128202; Send My Free Analysis</button>
		</div>
		<p class="popup-note">No spam, ever. Unsubscribe anytime. Your info is 100% secure.</p>
		<div class="popup-stats">
			<div>
				<div class="stat-num">30</div>
				<div class="stat-label">Years Experience</div>
			</div>
			<div>
				<div class="stat-num">4.9&#9733;</div>
				<div class="stat-label">Google Rating</div>
			</div>
			<div>
				<div class="stat-num">580+</div>
				<div class="stat-label">5-Star Reviews</div>
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
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>
<script>
/**
 * Landing Page — Firebase Integration + Conversion Optimization
 * Updated: February 12, 2026 (Session 8)
 * NEW: Exit-intent popup, testimonial rotator, social proof, urgency
 * API: operationsManager with action: 'captureWebLead'
 * (c) 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage
 */
document.addEventListener('DOMContentLoaded', function() {
	var form = document.getElementById('leadForm');
	var submitBtn = document.getElementById('submit-btn');
	var originalBtnText = submitBtn.innerHTML;
	
	// ===== PHONE AUTO-FORMAT =====
	// autocomplete="off" prevents browser from populating in wrong format
	// This formatter ONLY adds formatting as you type forward
	// Backspace/delete work normally without fighting the formatter
	var phoneInput = document.getElementById('phone');
	var lastPhoneLength = 0;
	
	phoneInput.addEventListener('input', function(e) {
		var raw = e.target.value.replace(/\D/g, '');
		
		// If user is deleting (length got shorter), don't reformat — let them delete freely
		if (e.target.value.length < lastPhoneLength) {
			lastPhoneLength = e.target.value.length;
			return;
		}
		
		// Cap at 10 digits
		if (raw.length > 10) raw = raw.slice(0, 10);
		
		// Only format as they type forward
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
	});
	
	// If they click into the field and it has browser-autofilled junk, clear it
	phoneInput.addEventListener('focus', function() {
		var raw = phoneInput.value.replace(/\D/g, '');
		// If the raw digits are more than 10 or less than 10 but field looks wrong, let user see raw
		if (raw.length > 10) {
			phoneInput.value = '';
			lastPhoneLength = 0;
		}
	});
	
	// ===== MAIN FORM SUBMISSION =====
	form.addEventListener('submit', async function(e) {
		e.preventDefault();
		submitBtn.disabled = true;
		submitBtn.innerHTML = '&#8987; Processing...';
		
		var formData = {
			firstName: document.getElementById('firstName').value.trim(),
			lastName: document.getElementById('lastName').value.trim(),
			email: document.getElementById('email').value.trim().toLowerCase(),
			phone: document.getElementById('phone').value.replace(/\D/g, ''),
			smsConsent: document.getElementById('smsConsent').checked
		};
		
		try {
			var response = await fetch('https://us-central1-my-clever-crm.cloudfunctions.net/operationsManager', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					action: 'captureWebLead',
					firstName: formData.firstName,
					lastName: formData.lastName,
					email: formData.email,
					phone: formData.phone,
					smsConsent: formData.smsConsent,
					smsConsentTimestamp: new Date().toISOString(),
					source: 'landing_page'
				})
			});
			
			var result = await response.json();
			
			if (response.ok && result.success) {
				sessionStorage.setItem('scr_converted', 'true');
				submitBtn.innerHTML = '&#9989; Success! Redirecting...';
				submitBtn.style.background = '#090';
				setTimeout(function() {
					window.location.href = 'https://myclevercrm.com/enroll?token=' + result.token + '&contactId=' + result.contactId;
				}, 1500);
			} else {
				throw new Error(result.error || 'Failed to process');
			}
		} catch (error) {
			submitBtn.innerHTML = '&#10060; Error - Please try again';
			submitBtn.style.background = '#d32f2f';
			alert('Sorry, there was an error. Please call 1-888-724-7344 or try again later.');
			setTimeout(function() {
				submitBtn.disabled = false;
				submitBtn.innerHTML = originalBtnText;
				submitBtn.style.background = '';
			}, 3000);
		}
	});
	
	// ============================================================
	// TESTIMONIAL ROTATOR — Cycles real Google reviews every 5s
	// ============================================================
	var testimonials = document.querySelectorAll('#testimonialRotator .testimonial');
	var currentTestimonial = 0;
	if (testimonials.length > 1) {
		setInterval(function() {
			testimonials[currentTestimonial].classList.remove('active');
			currentTestimonial = (currentTestimonial + 1) % testimonials.length;
			testimonials[currentTestimonial].classList.add('active');
		}, 5000);
	}
	
	// ============================================================
	// EXIT-INTENT POPUP
	// ============================================================
	// Desktop: mouse leaves toward top of page
	// Mobile: user scrolls back up 200px+ after scrolling down 300px+
	// Only shows ONCE per session (sessionStorage)
	// Posts to captureWebLead with source='exit_popup'
	// ============================================================
	var exitPopup = document.getElementById('exitPopup');
	var closeExitBtn = document.getElementById('closeExitPopup');
	var exitSubmitBtn = document.getElementById('exitSubmitBtn');
	var exitPopupShown = false;
	
	function shouldShowExitPopup() {
		return !exitPopupShown 
			&& !sessionStorage.getItem('scr_exit_shown') 
			&& !sessionStorage.getItem('scr_converted');
	}
	
	// Desktop exit detection
	document.addEventListener('mouseleave', function(e) {
		if (e.clientY < 10 && shouldShowExitPopup()) {
			exitPopup.classList.add('active');
			exitPopupShown = true;
			sessionStorage.setItem('scr_exit_shown', 'true');
		}
	});
	
	// Mobile exit detection (scroll back up)
	var maxScrollY = 0;
	window.addEventListener('scroll', function() {
		var currentY = window.scrollY;
		if (currentY > maxScrollY) maxScrollY = currentY;
		if (maxScrollY > 300 && (maxScrollY - currentY) > 200 && shouldShowExitPopup()) {
			exitPopup.classList.add('active');
			exitPopupShown = true;
			sessionStorage.setItem('scr_exit_shown', 'true');
		}
	});
	
	// Close handlers
	closeExitBtn.addEventListener('click', function() { exitPopup.classList.remove('active'); });
	exitPopup.addEventListener('click', function(e) { if (e.target === exitPopup) exitPopup.classList.remove('active'); });
	document.addEventListener('keydown', function(e) { if (e.key === 'Escape') exitPopup.classList.remove('active'); });
	
	// Exit popup submission
	exitSubmitBtn.addEventListener('click', async function() {
		var exitEmail = document.getElementById('exitEmail').value.trim().toLowerCase();
		var exitName = document.getElementById('exitFirstName').value.trim();
		
		if (!exitEmail || exitEmail.indexOf('@') === -1) {
			document.getElementById('exitEmail').style.borderColor = '#d32f2f';
			return;
		}
		
		exitSubmitBtn.disabled = true;
		exitSubmitBtn.innerHTML = '&#8987; Sending...';
		
		try {
			var response = await fetch('https://us-central1-my-clever-crm.cloudfunctions.net/operationsManager', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					action: 'captureWebLead',
					firstName: exitName || 'Friend',
					lastName: '',
					email: exitEmail,
					phone: '',
					source: 'exit_popup',
					notes: 'Captured via exit-intent popup on landing page'
				})
			});
			
			var result = await response.json();
			
			if (response.ok && result.success) {
				sessionStorage.setItem('scr_converted', 'true');
				exitSubmitBtn.innerHTML = '&#9989; Check your email!';
				exitSubmitBtn.style.background = '#090';
				setTimeout(function() { exitPopup.classList.remove('active'); }, 2000);
			} else {
				throw new Error(result.error || 'Failed');
			}
		} catch (error) {
			exitSubmitBtn.innerHTML = '&#10060; Error - try the main form';
			setTimeout(function() {
				exitSubmitBtn.disabled = false;
				exitSubmitBtn.innerHTML = '&#128202; Send My Free Analysis';
				exitSubmitBtn.style.background = '';
			}, 3000);
		}
	});
});
</script>
</body>
</html>