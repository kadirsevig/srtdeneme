<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONS isteği için hızlı çıkış
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Güvenlik için basit bir token kontrolü (isteğe bağlı)
// $secret_token = 'your_secret_token_here';
// if (!isset($_POST['token']) || $_POST['token'] !== $secret_token) {
//     http_response_code(403);
//     echo json_encode(['success' => false, 'error' => 'Unauthorized']);
//     exit;
// }

$newsFile = '../data/news.json';

// POST isteği - Haberleri kaydet
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['news']) || !is_array($data['news'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid data format']);
        exit;
    }
    
    // JSON formatına çevir
    $jsonData = [
        'news' => $data['news']
    ];
    
    // Dosyayı yaz
    $result = file_put_contents($newsFile, json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to write file']);
    } else {
        echo json_encode(['success' => true, 'message' => 'News saved successfully', 'count' => count($data['news'])]);
    }
    exit;
}

// GET isteği - Haberleri oku
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($newsFile)) {
        $content = file_get_contents($newsFile);
        echo $content;
    } else {
        echo json_encode(['news' => []]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);

