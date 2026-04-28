<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Mews\Captcha\Facades\Captcha;

try {
    $data = Captcha::create('math', true);
    print_r($data);
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
