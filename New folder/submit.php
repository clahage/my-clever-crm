<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Validate and sanitize input
$required = ['firstName','lastName','email','birthDate','ssn','street','city','state','zip','offerCode','planCode'];
foreach ($required as $field) {
  if (!isset($_POST[$field]) || $_POST[$field] === '') {
    http_response_code(400);
    die("Missing field: $field");
  }
}

// Prepare data for IDIQ API
try {
  $birthDate = date('m/d/Y', strtotime($_POST['birthDate']));
} catch (Exception $e) {
  http_response_code(400);
  die("Invalid birthDate format");
}

$data = [
  "birthDate" => $birthDate,
  "email" => filter_var($_POST['email'], FILTER_SANITIZE_EMAIL),
  "firstName" => htmlspecialchars($_POST['firstName']),
  "lastName" => htmlspecialchars($_POST['lastName']),
  "middleNameInitial" => "", // Optional
  "ssn" => htmlspecialchars($_POST['ssn']),
  "offerCode" => htmlspecialchars($_POST['offerCode']),
  "planCode" => htmlspecialchars($_POST['planCode']),
  "street" => htmlspecialchars($_POST['street']),
  "city" => htmlspecialchars($_POST['city']),
  "state" => strtoupper(htmlspecialchars($_POST['state'])),
  "zip" => htmlspecialchars($_POST['zip'])
];

// TODO: Call your backend or directly the IDIQ API here (using cURL or Guzzle)
// Example: $response = enrollUserWithIDIQ($data);

// For now, just show a success message
http_response_code(200);
echo "<h2>Thank you! Your application has been received.</h2>";
echo "<p>We will review your information and contact you soon.</p>";
?>
