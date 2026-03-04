<?php

foreach ($_ENV as $key => $value) {
	putenv("$key=$value");
}

function checkENV($env_name)
{
	return (getenv($env_name) && getenv($env_name) != '') ? getenv($env_name) : false;
}

# MariaDB
define('DB_HOST', (checkENV('DB_HOST')) ?: (isset($DB_HOST) ? $DB_HOST : false));
define('DB_USER', (checkENV('DB_USER')) ?: (isset($DB_USER) ? $DB_USER : false));
define('DB_PASS', (checkENV('DB_PASS')) ?: (isset($DB_PASS) ? $DB_PASS : false));
define('DB_NAME', (checkENV('DB_NAME')) ?: (isset($DB_NAME) ? $DB_NAME : false));
define('DB_PREFIX', (checkENV('DB_PREFIX')) ?: (isset($DB_PREFIX) ? $DB_PREFIX : false));
define('DB_NAME_YMS', (checkENV('DB_NAME_YMS')) ?: (isset($DB_NAME_YMS) ? $DB_NAME_YMS : false));
