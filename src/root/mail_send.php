<?php

//$_POST['Quantity-guests'] = "WSTD_TEST_NOW";
//$_POST['Date'] = "WSTD_TEST_NOW@test.test";
//$_POST['Time'] = "123-123-23";
//$_POST['Name'] = "1";
//$_POST['Tel-number'] = "1";

//file_put_contents('mail_send_log.txt', PHP_EOL . '===============================' . PHP_EOL .  var_export($_REQUEST,true) . PHP_EOL, FILE_APPEND | LOCK_EX);

//file_put_contents('mail_send_log.txt', PHP_EOL . '===============================' . PHP_EOL .  date("d-m-Y H:i:s") . PHP_EOL, FILE_APPEND | LOCK_EX);
//file_put_contents('mail_send_log.txt', PHP_EOL . '_______________________________' . PHP_EOL . 'POST ARRAY' . PHP_EOL . PHP_EOL . var_export($_POST,true) . PHP_EOL, FILE_APPEND | LOCK_EX);
//file_put_contents('mail_send_log.txt', PHP_EOL . '_______________________________' . PHP_EOL . 'FILES ARRAY' . PHP_EOL . PHP_EOL . var_export($_FILES,true) . PHP_EOL, FILE_APPEND | LOCK_EX);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

/**
 * INIT DATA
 */
//Send mail by that mailboxes.
$admin_emails = array('vm@websterstd.com');
//Check required variables.
$required_vars = array('name', 'phone', 'address');
//Project name
$project_name = 'Френдс — заявка';

/**
 * SPECIAL FIELDS NAMES
 *
 * files_links OR files_links[] - for file path (full)
 */


/**
 * SPECIAL FIELDS NAMES
 *
 * files_links OR files_links[] - for file path (full)
 */


/**
 * Class MailSend
 */
class MailSend{
    protected $emails = array();
    protected $required_vars = array();
    protected $project_name = '';

    protected $files_folder = 'forms_files';

    protected $mail_attachment = array();

    protected $boundary = '';

    protected $fl_error = false;

    protected $files = '';
    protected $message = '';
    protected $headers = '';
    protected $title = '';
    protected $multipart = '';


    protected $answer_massages = array(
        0 => array(
            "status" => 'success',
            "message" => 'Success. Mail sended.'
        ),
        1 => array(
            "status" => 'error',
            "message" => 'Post data error.'
        ),
        2 => array(
            "status" => 'error',
            "message" => 'Php function "mail()" don\'t work.'
        ),
        3 => array(
            "status" => 'warning',
            "message" => 'Directory "forms_files" don\'t exist and cannot be created.'
        ),
        4 => array(
            "status" => 'error',
            "message" => 'Can\'t upload file to server.'
        ),
        5 => array(
            "status" => 'error',
            "message" => 'PHP function "fread" error.'
        )
    );

    protected $answer = array();

    public function __construct( $emails, $required_vars, $project_name ) {
        $this->boundary = "--" . md5( uniqid( time() ) );

        $this->createFilesDirectory();


        $this->emails = $emails;
        $this->required_vars = $required_vars;
        $this->project_name = $project_name . ' - ';

        $this->setTitle();
    }

    /**
     * Send all mails.
     */
    public function sendMail() {
        if( $_FILES ) {
            $this->formatFilesArray();
            $this->uploadFilesToServer();
        }

        if( $this->checkPostVariable( 'files_links' ) ) {
            $this->setAttachmentArray();
        }

        $this->validatePostData();

        $this->setMailMessage();
        $this->setMailAttachment();

        $this->makeMultipartMail();

        $this->sendMessage();

        $this->setGlobalAnswer();

        $this->printResult();
    }

    /**
     *
     */
    protected function setAttachmentArray(  ) {
        //name + data
        if( is_array( $_REQUEST['files_links'] ) ) {
            foreach( $_REQUEST['files_links'] as $k => $link ) {
                if( $link ) {
                    $this->mail_attachment[$k]['name'] = $this->getRemoteFileName($link,$k);
                    $this->mail_attachment[$k]['data'] = file_get_contents($link);
                }
            }
        }else {
            if( $_REQUEST['files_links'] ) {
                $this->mail_attachment[0]['name'] = $this->getRemoteFileName($_REQUEST['files_links'],0);;
                $this->mail_attachment[0]['data'] = file_get_contents($_REQUEST['files_links']);
            }
        }
    }

    protected function getRemoteFileName( $link, $k ) {
        $name = 'file'.$k;
        $f = fopen($link, "rb");
        $data = stream_get_meta_data($f);
        fclose($f);

        if( isset( $data['wrapper_data'] ) ){
            if( preg_match('~Content-Disposition\:\h*attachment\;\h*filename="(.*)"\;filename\*=UTF-8\'\'(.*)~i',implode(PHP_EOL, $data['wrapper_data']),$match) ) {
                if( $match[2] ) {
                    $name = urldecode($match[2]);
                }
            }
        }else {
            $arr = explode('/', explode('?', $data['uri'])[0]);
            $match = $arr[count($arr)-1];
            if( $match ) {
                $name = $match;
            }
        }

        return $name;
    }

    /**
     * Separate files data by file into array.
     */
    protected function  formatFilesArray() {
        $new_files = array();
        foreach( $_FILES as $k => $v ) {
            if( is_array( $v['name'] ) ) {
                $new_files[$k]['multiple'] = true;
                foreach( $v['name'] as $num => $val ) {
                    $new_files[$k][$num]['name'] = $val;
                    $new_files[$k][$num]['type'] = $v['type'][$num];
                    $new_files[$k][$num]['tmp_name'] = $v['tmp_name'][$num];
                    $new_files[$k][$num]['error'] = $v['error'][$num];
                    $new_files[$k][$num]['size'] = $v['size'][$num];
                }
            }else {
                $new_files[$k]['multiple'] = false;
                $new_files[$k] = $v;
            }
        }
        $_FILES = $new_files;
    }

    /**
     * Enumeration elements of array$_FILES.
     */
    protected function uploadFilesToServer() {
        foreach( $_FILES as $field_data ) {

            if( $field_data['multiple'] ) {
                foreach( $field_data as $k => $file ) {
                    if( $k !== 'multiple' ) {
                        $this->uploadFileToServer( $file, $k );
                    }
                }
            }else {
                $this->uploadFileToServer( $field_data );
            }
        }
    }

    /**
     * Upload file.
     *
     * @param array $file_array
     */
    protected function uploadFileToServer( $file_array, $num = 0 ) {

        if( !empty($file_array['tmp_name']) && is_uploaded_file($file_array['tmp_name']) ) {
            $path = $this->files_folder . '/' . $file_array['name'];
            if (move_uploaded_file($file_array['tmp_name'], $path)) {
                $this->mail_attachment[$num]['name'] = $file_array['name'];
                $this->mail_attachment[$num]['path'] = $path;
                chmod($path, 0644);
            }else {
                $this->addAnswerMassage(4);
            }
        }
    }

    /**
     * Create new directory for upload files from form, if don't exist.
     */
    protected function createFilesDirectory() {
        if( !file_exists($this->files_folder) ) {
            if( !mkdir($this->files_folder, 0700, true) ) {
                $this->addAnswerMassage(3);
            }
        }
    }

    /**
     * Set mail title
     */
    protected function setTitle() {
        if( $this->checkPostVariable( 'title' ) ) {
            $this->title = $this->prepareMessageTheme( $this->project_name . $_POST['title'] );
            $this->project_name .= $_POST['title'];
            unset($_POST['title']);
        }else {
            $this->title = $this->prepareMessageTheme($this->project_name . 'Site feedback');
            $this->project_name .= 'Site feedback';
        }

    }
    /**
     * Send mails.
     */
    protected function sendMessage() {

//            $headers = $this->setMailHeaders( $mail );
            $mail = new PHPMailer(true);
            try {
                $mail->SMTPDebug = 0;
                $mail->isSMTP();
                $mail->Host = 'smtp.yandex.ru';
                $mail->SMTPAuth = true;
                $mail->Port = 25;

                $mail->Username = 'noreply@nikolsky.rest';
                $mail->Password = 'Nikor532';

                $mail->CharSet = 'UTF-8';


                $mail->setFrom('noreply@friends.ru', 'Френдс');
                foreach($this->emails as $address){
                    $mail->addAddress($address);
                }

                //    $mail->addReplyTo('info@example.com', 'Information');


                $mail->isHTML(true);                                  // Set email format to HTML
                $mail->Subject = $this->project_name;
                $mail->Body    = $this->message;
//                $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

                $mail->send();
                $this->addAnswerMassage(0);
            } catch (Exception $e) {
                $this->addAnswerMassage(2);
//                echo 'Message could not be sent.';
//                echo 'Mailer Error: ' . $mail->ErrorInfo;
            }
//            if( !(mail($mail, , $this->multipart, $headers)) ) {

//            }else{

//            }

    }
    /**
     * Set mail headers.
     *
     * @param string $mail
     * @return string
     */
    protected function setMailHeaders( $mail ) {
        return "MIME-Version: 1.0" . PHP_EOL .
            "Content-Type: multipart/mixed; boundary=\"" . $this->boundary . "\"" . PHP_EOL .
            'From: '.$this->title.' <'.$mail.'>' . PHP_EOL .
            'Reply-To: '.$mail.'' . PHP_EOL;

    }
    protected function prepareMessageTheme( $text ) {
        return '=?UTF-8?B?'.base64_encode($text).'?=';
    }
    /**
     * Preparing all POST variables for send.
     */
    protected function setMailMessage() {
        $c = true;
        foreach ( $_POST as $key => $value ) {
            if ( $value != "" && $key != 'files_links' ) {
                $title = ucfirst($key);
                $val = $this->makeVariableValue( $value );
                $this->message .= "
                " . ( ($c = !$c) ? '<tr>':'<tr style="background-color: #f8f8f8;">' ) . "
                <td style='padding: 10px; border: #e9e9e9 1px solid;'><b>$title</b></td>
                <td style='padding: 10px; border: #e9e9e9 1px solid;'>$val</td>
                </tr>
                ";
            }
        }

        $this->message = "<table style='width: 100%;'>$this->message</table>";
    }

    /**
     * @param $value
     * @return string
     */
    protected function makeVariableValue( $value ) {
        $value = ( is_array($value) ) ? implode( PHP_EOL, $value ) : $value;
        return iconv(mb_detect_encoding($value),"UTF-8",$value);
    }

    /**
     *
     */
    protected function setMailAttachment() {
        foreach( $this->mail_attachment  as $file ) {
            if( isset($file['data']) ) {
                $this->setFileMailAttachment( $file['data'], $file['name'] );
            }else {
                $f = fopen($file['path'], "rb");
                if( $f ) {
                    $data = fread($f,  filesize( $file['path'] ) );

                    if( $data ) {
                        $this->setFileMailAttachment( $data, $file['name'] );
                    }else {
                        $this->addAnswerMassage(5);
                    }
                }
                fclose($f);
            }
        }
    }

    /**
     * @param $data
     * @param $name
     */
    protected function setFileMailAttachment( $data, $name ) {
        $output = '';

        $output .=  PHP_EOL . "--" . $this->boundary . PHP_EOL;
        $output .= "Content-Type: application/octet-stream;" . PHP_EOL;// name=\"$NameFile\"" . PHP_EOL;
        $output .= "Content-Transfer-Encoding: base64" . PHP_EOL;
        $output .= "Content-Disposition: attachment; filename=\"" . $name . "\"" . PHP_EOL;
        $output .= PHP_EOL; // раздел между заголовками и телом прикрепленного файла
        $output .= chunk_split(base64_encode($data));

        $this->files .= $output;
    }
    /**
     *
     */
    protected function makeMultipartMail() {
        //message
        $multipart  = "--" . $this->boundary . PHP_EOL;
        $multipart .= "Content-Type: text/html; charset=utf-8" . PHP_EOL;
        $multipart .= "Content-Transfer-Encoding: base64" . PHP_EOL;
        $multipart .= PHP_EOL; // раздел между заголовками и телом html-части
        $multipart .= chunk_split(base64_encode($this->message));

        $multipart .= $this->files;
        $multipart .= PHP_EOL . "--" . $this->boundary . "--" . PHP_EOL;

        $this->multipart = $multipart;
    }
    /**
     * Validate post data.
     */
    protected function validatePostData() {
        foreach( $this->required_vars as $name ) {
            if( !$this->checkPostVariable($name) ) {
                $this->fl_error = true;

                $this->addAnswerMassage(1);
                $this->setGlobalAnswer();

                $this->stopScript();
            }
        }
    }
    /**
     * Add message by code to answer.
     *
     * @param integer $code
     */
    protected function addAnswerMassage( $code ) {
        $this->answer['messages'][] =  $this->answer_massages[$code];
    }
    /**
     *  Set global operation status & massage.
     */
    protected function setGlobalAnswer() {
        if( $this->fl_error ) {
            $this->answer['status'] = 'error';
            $this->answer['message'] = 'Error. Script stopped!';
        }else {
            $this->answer['status'] = 'success';
            $this->answer['message'] = 'Success. Script executed.';
        }
    }
    /**
     * Print JSON string.
     */
    protected function printResult() {
        print_r( json_encode($this->answer) );
    }
    /**
     * Stop execute script.
     */
    protected function stopScript() {
        $this->printResult();
        exit();
    }
    /**
     * Validate post variable.
     *
     * @param string $name      Name of POST variable.
     * @return bool
     */
    protected function checkPostVariable( $name ) {
        $r = false;
        if( isset($_POST[$name]) && $_POST[$name] != "" )
            $r = true;

        return $r;
    }

}

/**
 * Init class and send mails.
 */
$cl = new MailSend( $admin_emails, $required_vars, $project_name );
$cl->sendMail();
