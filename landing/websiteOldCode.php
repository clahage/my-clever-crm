<!DOCTYPE html>
<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/template/configuration.php'; ?>
<html lang="en">
    <head>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function(){
                $("#signup").on("submit", function(){
                    $("#pageloader").fadeIn();
                });//submit
            });//document ready
        </script>
        <meta charset="UTF-8">
        <meta name="description" content="Sign up with Speedy Credit Repair today to get you 100% free credit report instantly! No payment method required.">
        <meta name="keywords" content="Credit Repair, Speedy Credit, Free Credit Report">
        <meta name="author" content="Speedy Credit Repair">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign Up | Speedy Credit Repair</title>
        <link rel="stylesheet" type="text/css" href="<?php echo $SITE_URL; ?>/template/stylesheet.css" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
        <style>
            #pageloader {
                background: rgba( 255, 255, 255, 0.8 );
                display: none;
                height: 100%;
                position: fixed;
                width: 100%;
                z-index: 99999999999;
            }
            #pageloader img {
                left: 50%;
                margin-left: -32px;
                margin-top: -32px;
                position: absolute;
                top: 50%;
            }
            .external {
                border: none;
                box-sizing: border-box;
                height: 100vh;
                width: 50%;
            }
        </style>
    </head>
    <body>
        <div id="pageloader">
            <img src="http://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif" alt="processing..." />
        </div>
    <?php
    session_start();
    // if New Client is signed in
    if(isset($_SESSION["email"]))
    {
        include_once $_SERVER['DOCUMENT_ROOT'] . '/template/header-custom.php';
        echo '
            <div id="blog" style="background-image:url(https://speedycreditrepair.com/template/images/background.jpg);background-position:center;background-size:110% auto;">
                <div class="container">
        ';
        // if session step is correct
        if(isset($_SESSION['step']) && $_SESSION['step'] == 7)
        {
            // Session
            $PartnerAccessToken = $_SESSION['PartnerAccessToken'];
            session_write_close();
            // DB CONNECTION
            define('DB_SERVER', 'localhost:3306');
            define('DB_USERNAME', 'speedy_crm');
            define('DB_PASSWORD', 'ScRcRm@Lagunita@2048');
            define('DB_NAME', 'speedy23_crm');
            $link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
            // if DB CONNECTION is not successful
            if($link === false)
            {
                // Kill Session
                session_unset();
                session_write_close();
                // Error Code #P701
                $to = "registration@speedycreditrepair.com";
                $from = "registration@speedycreditrepair.com";
                $subject = "Signup Unsuccessful - Database Connection Failure";
                $message = 'Error #P001: A client signup was unsuccessful due to a failure in the database connection.';
                $headers = "From:" . $from;
                mail($to,$subject,$message,$headers);
                // Redirect
                header("Location: sign-in.php");
            }
            // if DB CONNECTION is successful
            else
            {
                // Member Access Token
                $MemberAccessToken_SQL = "
                    SELECT
                        `MemberAccessToken`
                    FROM
                        `clients`
                    WHERE
                        `id` = '".$_SESSION['id']."' 
                    AND 
                        `email` = '".$_SESSION['email']."'
                    LIMIT
                        1
                ";
                $MemberAccessToken_RESULT = $link->query($MemberAccessToken_SQL);
                $MemberAccessToken_ROW = $MemberAccessToken_RESULT->fetch_assoc();
                $MemberAccessToken = $MemberAccessToken_ROW['MemberAccessToken'];
                // CONTENT
                echo "
                    <script>
                        window.IDIQ_CREDIT_REPORT_CONFIG = {
                            jwtToken: '".$MemberAccessToken."',
                        };
                    </script>
                ";
                echo '
                    <script src="https://idiq-prod-web-api.web.app/idiq-credit-report/index.js"></script>
                    <div class="interface" style="display:none;">
                        <a href="sign-out.php" class="sign-out">Sign Out</a>
                        <div class="portal">
                            <idiq-credit-report id="myInput"></idiq-credit-report>
                        </div>
                    </div>
                ';
                echo '
                    <div class="interface special" id="remove">
                        <div class="signup">
                            <div class="pseudo">
                            <p>Speedy Credit Repair, Inc. provides a 100% free credit report from all three major credit bureaus- Equifax, Experian, and Transunion. Additionally, you will receive a personalized credit review from one of our credit experts via email at no additional cost.</p>
                            <p>After receiving your free credit report and review, if you wish to utilize Speedy Credit Repair\'s credit repair services, you may call us at 1-888-724-7344 during business hours to speak with one of our credit experts.</p>
                            <button onclick="myFunction()">I Understand</button>
                            </div>
                        </div>
                    </div>
                    <div class="interface" id="remove">
                        <div class="signup">
                            <form id="signup" method="POST">
                                <p>Great! We have everything we need on our end! Your free credit report is now ready to view.</p>
                                <p>Additionally, you can view your credit reports at any time by visiting Speedy Credit Repair\'s website on your phone or computer using the email address and password you used to get your free credit report.</p>
                                <input type="text" id="copyingText" name="html" style="display:none;" />
                                <input type="text" value="Copy Test" id="myInput" style="display:none;" />
                                <p id="load0" class="loader" style="display:block;">Loading your credit report, please wait. Do not refresh this page! This can take up to 15 seconds.</p>
                                <input id="load1" style="display:none;" type="submit" name="submit" value="View My Credit Report" />
                            </form>
                        </div>
                    </div>
                ';
                if(isset($_POST['submit']))
                {
                    // Santitize
                    $var_html = addslashes($_POST['html']);

                    // Create New Client
                    $new_client_sql = "
                        INSERT INTO reports (
                            `ref`,
                            `html`,
                            `datetime`
                        )
                        VALUES (
                            '".$_SESSION['id']."', 
                            '".$var_html."',
                            NOW()
                        ) ";
                    $new_client_result = $link->query($new_client_sql);
                    // Send Email From Server
                    $to = "registration@speedycreditrepair.com";
                    $from = "registration@speedycreditrepair.com";
                    $subject = "New Signup from Form";
                    $message = '
                        A new signup was just completed by '.$_SESSION['name_first'].' '.$_SESSION['name_last'].'.
                        
                        User Device Information
                        IP Address: '.$_SESSION['ip'].'
                        Browser: '.$_SESSION['refer_2'].'
                        
                        Information Obtained
                        first name:'.$_SESSION['name_first'].'
                        middle name:'.$_SESSION['name_middle'].'
                        last name:'.$_SESSION['name_last'].'
                        birth date:'.$_SESSION['dob'].'
                        email:'.$_SESSION['email'].'
                        phone number:'.$_SESSION['phone'].'
                        address 1:'.$_SESSION['address_1'].'
                        address 2:'.$_SESSION['address_2'].'
                        city:'.$_SESSION['city'].'
                        state:'.$_SESSION['state'].'
                        zip code:'.$_SESSION['zip'].'
                        occupation:'.$_SESSION['occupation'].'
                        ssn:'.$_SESSION['ssn'].'
                        usn to idiq:'.$_SESSION["email"].'
                        pwd to idiq:'.$_SESSION["password"].'
                        refer:'.$_SESSION['refer_1'].'
                        goal:'.$_SESSION['goal'].'
                    ';
                    $headers = "From:" . $from;
                    mail($to,$subject,$message,$headers);
                    // Session
                    session_start();
                    // SET STEP
                    $_SESSION["ssn"] = "0";
                    $_SESSION["step"] = "0";
                    $update_step_sql = "
                        UPDATE 
                            `clients`
                        SET
                            `step` = '".$_SESSION["step"]."'
                        WHERE 
                            `id` = '".$_SESSION["id"]."'
                        AND
                            `email` = '".$_SESSION["email"]."'
                        LIMIT
                            1
                    ";
                    $update_step_result = $link->query($update_step_sql);
                    session_write_close();
                    // Redirect
                    header("Location: portal.php");
                }
            }
        }
        // if session step is not correct
        else
        {
            // Session
            session_write_close();
            // if step is not zero
            if($_SESSION['step'] !== 0)
            {
                $url = $_SESSION['step'];
                header("Location: part-$url.php");
            }
            // if step is zero
            else
            {
                header("Location: portal.php");
            }
        }
        include_once $_SERVER['DOCUMENT_ROOT'] . '/app/interface/featured.php';
        echo '
                </div>
            </div>
        ';
        include_once $_SERVER['DOCUMENT_ROOT'] . '/template/footer.php';
    }
    // if New Client is not signed in
    else
    {
        // Session
        session_unset();
        session_write_close();
        header("Location: part-1.php");
    }
?>
    <script>
      function myFunction() {
        // get the OUTER html of the element you want to copy
        var text = document.getElementById('myInput').outerHTML;

        // put that outerHTML into another textbox for copying
        var tempTextbox = document.getElementById('copyingText');
        tempTextbox.value = text;
        
        document.execCommand("Copy");
      }
    </script>
    <script type="text/javascript">
        var button = document.getElementById('remove')
        button.addEventListener('click',hideshow,false);

        function hideshow() {
            document.getElementById('remove').style.display = 'block'; 
            this.style.display = 'none'
        }   
    </script>
    <script>
        var divElement2 = document.getElementById('load0');
          setTimeout(function () {
             divElement2.style.display = 'none'
          }, 15000);
    </script>
    <script>
        var divElement = document.getElementById('load1');
          setTimeout(function () {
             divElement.style.display = 'block'
          }, 15000);
    </script>
</body>

</html>