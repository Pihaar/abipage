<?php

/*
 * Copyright (C) 2012 Johannes Bechberger
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

class User {

    const ADMIN_MODE = 3;
    const MODERATOR_MODE = 2;
    const EDITOR_MODE = 1;
    const NORMAL_MODE = 0;
    const NO_MODE = -1;

    private $id;
    private $name;
    private $math_course;
    private $math_teacher;
    private $mail_adress;
    private $mode;
    private $activated;
    private $crypt_str;
    private $visible;
    private $db;

    public function __construct($id, $name, $math_course, $math_teacher, $mail_adress, $mode, $activated, $crypt_str, $visible = true, $data = array()) {
        $db = Database::getConnection();
        $this->id = intval($id);
        $this->name = $db->real_escape_string($name);
        $this->math_course = $db->real_escape_string($math_course);
        $this->math_teacher = $db->real_escape_string($math_teacher);
        $this->mail_adress = $db->real_escape_string($mail_adress);
        $this->mode = !$activated ? self::NO_MODE : intval($mode);
        $this->activated = $activated;
        $this->crypt_str = $db->real_escape_string($crypt_str);
        $this->visible = $visible;
        $this->data = !empty($data) ? $data : array();
        $this->db = Database::getConnection();
    }

    public static function getFromArray($array) {
        if ($array == null || !isset($array["id"]) || $array["id"] == "") {
            return null;
        }
        if (isset($array["first_name"]) && isset($array["last_name"])) {
            $array["name"] = $array["first_name"] . ' ' . $array["last_name"];
        }
        return new User($array["id"], $array["name"], $array["math_course"], $array["math_teacher"], $array["mail_adress"], $array["mode"], $array["activated"], $array["crypt_str"], $array["visible"], (array)$array["data"]);
    }

    public static function getFromMySQLResult($mysql_result) {
        if ($mysql_result == null) {
            return null;
        }
        $res = $mysql_result->fetch_array();
        if ($res == null) {
            return null;
        }
        $res["data"] = json_decode($res["data"], false);
        return self::getFromArray($res);
    }

    public static function getByName($name) {
        global $db;
        $arr = explode(" ", $db->real_escape_string($name));
        $str = $arr[0];
        for ($i = 1; $i < count($arr) - 1; $i++) {
            $str .= " " . $arr[$i];
        }
        return User::getFromMySQLResult($db->query("SELECT * FROM " . DB_PREFIX . "user WHERE first_name='" . $str . "' AND last_name='" . $arr[count($arr) - 1] . "'"));
    }

    public static function getByID($id) {
        global $db;
        return User::getFromMySQLResult($db->query("SELECT * FROM " . DB_PREFIX . "user WHERE id=" . intval($id)));
    }

    public static function getByEMailAdress($mail_adress) {
        global $db;
        return User::getFromMySQLResult($db->query("SELECT * FROM " . DB_PREFIX . "user WHERE mail_adress=" . cleanInputText($mail_adress)));
    }

    public static function getByMode($mode) {
        global $db;
        $res = $db->query("SELECT * FROM " . DB_PREFIX . "user WHERE mode>=" . intval($mode));
        $retarr = array();
        while ($user = User::getFromMySQLResult($res)) {
            $retarr[] = $user;
        }
        return new UserArray($retarr);
    }

    /**
      don't forget:
      if ($activated == 1){
      Auth::login($name, $pwd);
      }
     */
    public static function create($name, $math_course, $math_teacher, $mail_adress, $pwd, $mode = self::NORMAL_MODE, $activated = 0, $visible = 1) {
        global $db;
        $name_arr = self::splitName($db->real_escape_string(trim($name)));
        $math_course = intval(is_numeric($math_course) ? $math_course : substr($math_course, 1));
        $math_teacher = $db->real_escape_string(trim($math_teacher));
        $mail_adress = $db->real_escape_string(trim($mail_adress));
        $crypt_str = Auth::crypt($pwd);
        $mode = intval($mode);
        $activated = intval($activated);
        $visible = intval($visible);
        if (self::getByName($name) == null) {
            $db->query('INSERT INTO ' . DB_PREFIX . "user(id, first_name, last_name, math_course, math_teacher, mail_adress, mode, activated, visible, crypt_str) VALUES(NULL, '$name_arr[0]', '$name_arr[1]', $math_course, '$math_teacher', '$mail_adress', $mode, $activated, $visible, '$crypt_str')");
            return User::getByName($name);
        } else {
            return false;
        }
    }

    public function updateDB() {
        $query = "UPDATE " . DB_PREFIX . "user SET";
        $query .= " first_name='" . $this->db->real_escape_string($this->getFirstName()) . "'";
        $query .= ", last_name='" . $this->db->real_escape_string($this->getLastName()) . "'";
        $query .= ", math_course=" . intval($this->getMathCourse());
        $query .= ", math_teacher='" . $this->db->real_escape_string($this->getMathTeacher()) . "'";
        $query .= ", mail_adress='" . $this->db->real_escape_string($this->getMailAdress()) . "'";
        $query .= ", crypt_str='" . $this->db->real_escape_string($this->getCryptStr()) . "' ";
        $query .= ", mode=" . intval($this->getMode());
        $query .= ", activated=" . ($this->isActivated() ? 1 : 0);
        $query .= ", visible=" . ($this->isVisible() ? 1 : 0);
        $query .= ", data='" . cleanValue(json_encode($this->data)) . "'";
        $query .= " WHERE id=" . intval($this->id);
        $this->db->query($query) or die($this->db->error);
    }

    public function getUserComments($with_notified_as_bad = false) {
        $arr = array();
        $db = Database::getConnection();
        $res = $db->query("SELECT * FROM " . DB_PREFIX . "user_comments 
		WHERE commented_userid=" . $this->id . (!$with_notified_as_bad ? " AND notified_as_bad=0" : "") . " AND reviewed=1
		ORDER BY time DESC");
        while ($comment = $res->fetch_array()) {
            $arr[] = $comment;
        }
        return $arr;
    }

    public function notifyUserComment($id) {
        $db = Database::getConnection();
        $db->query("UPDATE " . DB_PREFIX . "user_comments SET notified_as_bad=1 WHERE id=" . intval($id));
    }

    public function unnotifyUserComment($id) {
        $db = Database::getConnection();
        $db->query("UPDATE " . DB_PREFIX . "user_comments SET notified_as_bad=0 WHERE id=" . intval($id));
    }

    public function postUserComment($text, $anonymous, $senduserid = null, $time = -1) {
        global $env;
        if ($senduserid == null) {
            $senduserid = Auth::getUserID();
        }
        if ($time == -1) {
            $time = time();
        }
        $ctext = cleanInputText($text);
        $db = Database::getConnection();
        $reviewed = $env->review_user_comments_automatically && ReviewText::checkText($text);
        $db->query("INSERT INTO " . DB_PREFIX . "user_comments(id, commented_userid, commenting_userid, text, time, notified_as_bad, reviewed, isanonymous)
					VALUES(NULL, " . $this->id . ", " . intval($senduserid) . ", '" . $ctext . "', " . intval($time) . ", 0, " . ($reviewed ? 1 : 0) . ", " . intval($anonymous) . ")");
        $env->addAction($this->db->insert_id, $this->name, "add_user_comment");
        return array("id" => $db->insert_id, "commented_userid" => $this->id, "commenting_userid" => intval($senduserid), "text" => $ctext, "time" => intval($time), "notified_as_bad" => 0, "reviewed" => ($reviewed ? 1 : 0), "anonymous" => intval($anonymous));
    }

    public static function reviewUserComment($id) {
        $db = Database::getConnection();
        $db->query("UPDATE " . DB_PREFIX . "user_comments SET reviewed=1 WHERE id=" . intval($id) . " AND commenting_userid!=" . Auth::getUserID());
    }

    public static function deleteUserComment($id) {
        $db = Database::getConnection();
        $db->query("DELETE FROM " . DB_PREFIX . "user_comments WHERE id=" . intval($id) . " AND commenting_userid!=" . Auth::getUserID()) or die($db->error);
    }

    public function getID() {
        return $this->id;
    }

    public function getName() {
        return $this->name;
    }

    public function getFirstName() {
        $arr = self::splitName($this->name);
        return $arr[0];
    }

    public function getLastName() {
        $arr = self::splitName($this->name);
        return $arr[1];
    }

    public static function splitName($name) {
        $name_arr = explode(' ', $name);
        $str = $name_arr[0];
        $last_name_prefix = false;
        for ($i = 1; $i < count($name_arr) - 1; $i++) {
            if ($name_arr[$i] != "von") {
                $str .= " " . $name_arr[$i];
            } else {
                $last_name_prefix = true;
            }
        }
        $name_arr[0] = $str;
        $name_arr[1] = $name_arr[count($name_arr) - ($last_name_prefix ? 2 : 1 )];
        return $name_arr;
    }

    public function getMathCourse() {
        return $this->math_course;
    }

    public function getMathTeacher() {
        return $this->math_teacher;
    }

    public function getMailAdress() {
        return $this->mail_adress;
    }

    public function getMode() {
        return $this->mode;
    }

    public function isEditor() {
        return $this->mode >= self::EDITOR_MODE;
    }

    public function isModerator() {
        return $this->mode >= self::MODERATOR_MODE;
    }

    public function isAdmin() {
        return $this->mode == self::ADMIN_MODE;
    }

    public function isActivated() {
        return $this->activated;
    }

    public function getCryptStr() {
        return $this->crypt_str;
    }

    public function setName($first_name, $last_name = "") {
        $this->name = $first_name;
        if ($last_name != "") {
            $this->name .= " " . $last_name;
        }
    }

    public function setMathCourse($course) {
        $this->math_course = $course;
    }

    public function setMathTeacher($teacher) {
        $this->math_teacher = $teacher;
    }

    public function setMailAdress($adress) {
        $this->mail_adress = $adress;
    }

    public function setMode($mode) {
        $mode = intval($mode);
        $this->mode = $mode > User::ADMIN_MODE ? User::NORMAL_MODE : $mode;
    }

    public function setActivated($activated) {
        $this->activated = $activated;
    }

    public function activate($send_mail = true) {
        global $env;
        if (!$this->activated) {
            if ($send_mail)
                $env->sendMail($this, "Ihr Benutzerkonto wurde aktiviert", "Ihr Benutzerkonto wurde aktiviert, sie können nun auf die Seite zugreifen.\n\nIhr \"" . $env->title . "\"-Team");
            $this->activated = true;
            $this->updateDB();
        }
    }

    public function deactivate() {
        $this->activated = false;
        $this->updateDB();
    }

    public function setPassword($pwd, $mail_user = false) {
        global $env;
        $this->crypt_str = Auth::crypt($pwd);
        if ($mail_user) {
            $env->sendMail($this->mail_adress, "Passwort verändert", "Benutzername: " . $this->name . "\nPasswort: " . $pwd);
        }
        $this->updateDB();
    }

    public function isVisible() {
        return $this->visible;
    }

    public function setVisible($visible) {
        $this->visible = $visible;
    }

    public function sendMail($topic, $text) {
        global $env;
        $env->sendMail($this->mail_adress, $topic, $text);
    }

    public function updateLastVisitTime() {
        $this->data["last_visit_time"] = time();
    }

    public function getLastVisitTime() {
        return isset($this->data["last_visit_time"]) ? $this->data["last_visit_time"] : -1;
    }

}