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

function tpl_usermanagement($userarr, $as_page = true, $urlapp = "") {
    if ($as_page) {
        tpl_before("usermanagement");
        tpl_item_before();
    }
    ?>
    <form method="post" <?php echo $urlapp != "" ? ('action="?' . $urlapp . '"') : "" ?> class="usermanagement">
        <input type="hidden" name="access_key" value="<?= Auth::getAccessKey() ?>"/>
        <table class="table table-striped tablesorter">
            <thead>
                <tr>
                    <th>Auswählen</th>
                    <th>ID</th>
                    <th>Vorname</th>
                    <th>Nachname</th>
                    <th>Mailadresse</th>
                    <th>Mathekurs</th>
                    <th>Mathlehrer</th>
                    <th>Modus</th>
                    <th>Aktiviert</th>
                    <th>Link</th>
                    <th>Einstellungen</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($userarr as $user): ?>
                    <tr>
                        <td>
                            <? if (!Auth::isSameUser($user) && Auth::canEditUser($user)): ?>
                                <input type="checkbox" value="true" name="<?php echo $user->getID() ?>"/>
                            <? endif; ?>
                        </td>
                        <td><?php echo $user->getID() ?></td>
                        <td><?php echo $user->getFirstName() ?></td>
                        <td><?php echo $user->getLastName() ?></td>
                        <td><a href="mailto:<?php echo $user->getMailAdress() ?>"><?php echo $user->getMailAdress() ?></a></td>
                        <td><?php echo $user->getMathCourse() ?></td>
                        <td><?php echo $user->getMathTeacher() ?></td>
                        <td><?php echo tpl_usermode_to_text($user->getMode()) ?></td>
                        <td><?php echo $user->isActivated() ? "Ja" : "Nein" ?></td>
                        <td><a href="<?= tpl_url('user/' . $user->getName()) ?>">Link</a></td>
                        <td><a href="<?= tpl_url('user/' . $user->getName() . '/preferences') ?>">Einstellungen</a></td>
                    </tr>
                <?php endforeach ?>
            </tbody>
        </table>
        Ausgewählte Benutzer  
        <button class="btn" type="submit" name="activate">Aktivieren</button>
        <button class="btn" type="submit" name="deactivate">Deaktivieren</button><br/>
        <?php if (Auth::canSetUserMode()): ?>
            Modus <?php tpl_usermode_combobox("mode") ?>
            <button class="btn" type="submit" name="setmode">setzen</button><br/>
            <button class="btn btn-danger" type="submit" name="delete">Benutzer löschen (Es werden dabei alle Beiträge der betreffenden Benutzer gelöscht!!!)</button><br/>
        <?php endif ?>
        <input type="password" name="password" style="width: 150px" placeholder="Neues Passwort"/>
        <button class="btn" type="submit" name="setpassword">Passwort setzen</button>
        (mit E-Mail Benachrichtigung der jeweiligen Benutzer)
        <? if (Auth::canSetUserVisibility()): ?>
        <input type="checkbox" checked="checked" name="visible"/>
        <button class="btn" name="setvisible">Sichtbar?</button>
        <? endif ?>
    </form>
    <?
    if ($as_page) {
        tpl_item_after();
        tpl_after();
    }
}