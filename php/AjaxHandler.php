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

class AjaxHandler extends ToroHandler {

    public function get($slug = "") {
        global $env, $store;
        $slug = $slug != "" ? substr($slug, 1) : "";
        switch ($slug) {
            case "last_actions":
                if (isset($_GET["id"])) {
                    jsonAjaxResponse(function() {
                                $actions_arr = Actions::getLastActions($_GET["id"]);
                                tpl_actions($actions_arr);
                                return array("last_action_id" => $actions_arr->getLastActionID());
                            });
                }
                break;
        }
    }

    public function post($slug = "") {
        global $env, $store;
        $slug = $slug != "" ? substr($slug, 1) : "";
        switch ($slug) {
            case "result_mode":
                if (isset($_POST["value"]) && $env->results_viewable) {
                    $store->result_mode_ud = $_POST["value"] == "true";
                }
                break;
        }
    }

}