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

function tpl_register() {
    global $env;
    tpl_before("register");
    tpl_item_before_form(array(), "", "", "register");
    //TODO pattern - test Chrome
    ?>
    <input type="text" name="name" title="Name ([Vorname] [Nachname])" placeholder="Name ([Vorname] [Nachname])" autocomplete="on" required="on" pattern="((von )?[A-ZÄÖÜ]([a-zßäöü](-[a-zßäöüA-ZÄÖÜ])?)+ ?){2,3}"/><br/>
    <input type="email" name="mail_adress" title="E-Mail-Adresse" placeholder="E-Mail-Adresse" autocomplete="on" required="on"/><br/>
    <input type="password" name="password" title="Passwort" placeholder="Passwort" autocomplete="on" required="on"/><br/>
    <input type="password" name="password_repeat" title="Passwort wiederholen" placeholder="Passwort wiederholen" autocomplete="on" required="on"/><br/>
    <input type="number" name="math_course" title="Mathekursnummer, z.B.: 1" placeholder="Mathekursnummer, z.B.: 1" min="1" max="20" required="on"/><br/>
    <input type="text" name="math_teacher" title='Mathelehrer, z.B. "Herr Müller"' placeholder='Mathelehrer, z.B. "Herr Müller"' required="on"/><br/>
    <?php if ($env->has_forum): ?>
        <input type="checkbox" value="true" name="reg_in_forum" checked/> <label for="reg_in_forum">Automatisch auch im Forum registrieren</label><br/>
    <?php endif ?>
    <?php if ($env->has_wiki): ?>
        <input type="checkbox" value="true" name="reg_in_wiki" checked/> <label for="reg_in_wiki">Automatisch auch im Wiki registrieren</label><br/>
    <?php endif ?>
    <?php
    tpl_infobox("", 'Sie stimmen mit der Registrierung den <a href="' . tpl_url("terms_of_use") . '" target="_blank">Nutzungsbedingungen</a> und der <a href="' . tpl_url("privacy") . '" target="_blank">Datenschutzrichtlinie</a> zu.');
    tpl_item_after_send("Registrieren", "register");
    tpl_after();
}

function tpl_welcome_wait_for_activation() {
    tpl_before("", "Willkommen");
    tpl_item_before();
    ?>
    Sie sind nun auf dieser Seite angemeldet.
    Bitte warten sie, bis sie von einem Moderator freigeschalten werden.
    <?php
    tpl_item_after();
    tpl_after();
}

function tpl_login() {
    $id = Auth::getCookieID();
    $namestr = "";
    if ($id != -1){
        $user = User::getByID($id);
        if ($user != null)
            $namestr = $user->getName();
    }
    tpl_before("login");
    tpl_item_before_form(array("action" => tpl_url("login")), "", "", "login");
    ?>
    <input type="text" name="name" title="Name" placeholder="Name" pattern="((von )?[A-ZÄÖÜ]([a-zßäöü](-[a-zßäöüA-ZÄÖÜ])?)+ ?){2,3}"<?= $namestr != "" ? (' value="' . $namestr . '"') : '' ?>><br/>
    <input type="password" name="password" title="Passwort" placeholder="Passwort" autocomplete="on"/><br/>
    <?php
    tpl_infobox("Passwort vergessen?", "", tpl_url("forgot_password"));
    tpl_item_after_send("Anmelden", "login");
    tpl_after();
}

function tpl_forgot_password() {
    tpl_before("", "Passwort vergessen");
    tpl_item_before_form(array(), "", "", "forgot_password");
    ?>
    <input type="text" name="name_or_email" title="Name oder E-Mail-Adresse" placeholder="Name oder E-Mail-Adresse"/><br/>
    <?php
    tpl_item_after_send();
    tpl_after();
}

function tpl_new_password($action_url) {
    tpl_before("", "Neues Passwort");
    tpl_item_before_form(array("action" => $action_url), "", "", "new_password");
    ?>
    <input type="password" name="pwd" placeholder="" title="Neues Passwort"/><br/>
    <input type="password" name="pwd_repeat" placeholder="" title="Neues Passwort wiederholen"/><br/>
    <?php
    tpl_item_after_send("Passwort setzen");
    tpl_after();
}

function tpl_terms_of_use() {
    global $env;
    tpl_before("terms_of_use");
    tpl_item_before();
    echo formatText($env->terms_of_use);
    tpl_item_after();
    tpl_after();
}