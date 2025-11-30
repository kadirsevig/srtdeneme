<?php
/**
 * Görsel Yükleme API
 * POST /api/upload.php - Görsel yükle
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

define('UPLOAD_DIR', __DIR__ . '/../uploads/news/');

// Upload klasörünü oluştur
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Sadece POST metodu desteklenir.']);
    exit;
}

if (empty($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dosya seçilmedi.']);
    exit;
}

$file = $_FILES['image'];
$allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

if (!in_array($file['type'], $allowed)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Desteklenmeyen dosya formatı. Sadece JPEG, PNG, GIF ve WEBP kabul edilir.']);
    exit;
}

if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dosya boyutu 5MB\'dan büyük olamaz.']);
    exit;
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = date('Y-m-d-') . bin2hex(random_bytes(8)) . '.' . strtolower($ext);
$filepath = UPLOAD_DIR . $filename;

if (move_uploaded_file($file['tmp_name'], $filepath)) {
    echo json_encode([
        'success' => true,
        'path' => 'uploads/news/' . $filename,
        'filename' => $filename
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Dosya yüklenirken bir hata oluştu.']);
}

