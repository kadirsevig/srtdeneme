<?php
/**
 * Haber API - CRUD İşlemleri
 * GET    /api/news.php         - Tüm haberleri listele
 * GET    /api/news.php?id=xxx  - Tek haber getir
 * POST   /api/news.php         - Yeni haber ekle
 * PUT    /api/news.php         - Haber güncelle
 * DELETE /api/news.php?id=xxx  - Haber sil
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONS request için (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Veri dosyası yolu
define('DATA_FILE', __DIR__ . '/../data/news.json');
define('UPLOAD_DIR', __DIR__ . '/../uploads/news/');

// Upload klasörünü oluştur
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

/**
 * Haberleri dosyadan oku
 */
function getNews() {
    if (!file_exists(DATA_FILE)) {
        return [];
    }
    $content = file_get_contents(DATA_FILE);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

/**
 * Haberleri dosyaya kaydet
 */
function saveNews($news) {
    $json = json_encode($news, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents(DATA_FILE, $json) !== false;
}

/**
 * Benzersiz ID oluştur
 */
function generateId() {
    return date('Y-m-d-') . bin2hex(random_bytes(4));
}

/**
 * Tarihe göre sırala (en yeni en üstte)
 */
function sortNewsByDate(&$news) {
    usort($news, function($a, $b) {
        $dateA = strtotime($a['date'] ?? '1970-01-01');
        $dateB = strtotime($b['date'] ?? '1970-01-01');
        return $dateB - $dateA;
    });
}

/**
 * Görsel yükle
 */
function uploadImage($file) {
    $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!in_array($file['type'], $allowed)) {
        return ['error' => 'Desteklenmeyen dosya formatı. Sadece JPEG, PNG, GIF ve WEBP kabul edilir.'];
    }
    
    if ($file['size'] > 5 * 1024 * 1024) { // 5MB limit
        return ['error' => 'Dosya boyutu 5MB\'dan büyük olamaz.'];
    }
    
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = date('Y-m-d-') . bin2hex(random_bytes(8)) . '.' . strtolower($ext);
    $filepath = UPLOAD_DIR . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return ['success' => true, 'path' => 'uploads/news/' . $filename];
    }
    
    return ['error' => 'Dosya yüklenirken bir hata oluştu.'];
}

/**
 * Görseli sil
 */
function deleteImage($path) {
    if (empty($path)) return;
    
    $fullPath = __DIR__ . '/../' . $path;
    if (file_exists($fullPath) && strpos($path, 'uploads/news/') === 0) {
        unlink($fullPath);
    }
}

// HTTP Method'a göre işlem yap
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Haberleri listele
            $news = getNews();
            sortNewsByDate($news);
            
            // Tek haber istendi mi?
            if (isset($_GET['id'])) {
                $id = $_GET['id'];
                $found = null;
                foreach ($news as $item) {
                    if ($item['id'] === $id) {
                        $found = $item;
                        break;
                    }
                }
                if ($found) {
                    echo json_encode(['success' => true, 'data' => $found]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Haber bulunamadı.']);
                }
            } else {
                echo json_encode(['success' => true, 'data' => $news]);
            }
            break;
            
        case 'POST':
            // Yeni haber ekle
            $title = trim($_POST['title'] ?? '');
            $excerpt = trim($_POST['excerpt'] ?? '');
            $content = trim($_POST['content'] ?? '');
            $date = trim($_POST['date'] ?? date('Y-m-d'));
            
            if (empty($title)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Başlık zorunludur.']);
                exit;
            }
            
            // Görselleri yükle
            $images = [];
            if (!empty($_FILES['images'])) {
                $files = $_FILES['images'];
                $fileCount = is_array($files['name']) ? count($files['name']) : 1;
                
                for ($i = 0; $i < $fileCount; $i++) {
                    if (is_array($files['name'])) {
                        $file = [
                            'name' => $files['name'][$i],
                            'type' => $files['type'][$i],
                            'tmp_name' => $files['tmp_name'][$i],
                            'error' => $files['error'][$i],
                            'size' => $files['size'][$i]
                        ];
                    } else {
                        $file = $files;
                    }
                    
                    if ($file['error'] === UPLOAD_ERR_OK) {
                        $result = uploadImage($file);
                        if (isset($result['path'])) {
                            $images[] = [
                                'src' => $result['path'],
                                'alt' => $title
                            ];
                        }
                    }
                }
            }
            
            // Mevcut görselleri koru (düzenleme durumunda)
            if (!empty($_POST['existing_images'])) {
                $existingImages = json_decode($_POST['existing_images'], true);
                if (is_array($existingImages)) {
                    $images = array_merge($existingImages, $images);
                }
            }
            
            $newNews = [
                'id' => generateId(),
                'title' => $title,
                'excerpt' => $excerpt,
                'content' => $content,
                'date' => $date,
                'images' => $images,
                'createdAt' => date('c'),
                'updatedAt' => date('c')
            ];
            
            $news = getNews();
            array_unshift($news, $newNews);
            
            if (saveNews($news)) {
                echo json_encode(['success' => true, 'data' => $newNews, 'message' => 'Haber başarıyla eklendi.']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Haber kaydedilemedi.']);
            }
            break;
            
        case 'PUT':
            // Haber güncelle
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            // Form data olarak geldiyse
            if (empty($data)) {
                parse_str($input, $data);
            }
            
            // multipart/form-data için POST kullan
            if (empty($data) && !empty($_POST)) {
                $data = $_POST;
            }
            
            $id = $data['id'] ?? $_GET['id'] ?? '';
            
            if (empty($id)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Haber ID\'si zorunludur.']);
                exit;
            }
            
            $news = getNews();
            $found = false;
            
            foreach ($news as &$item) {
                if ($item['id'] === $id) {
                    $item['title'] = trim($data['title'] ?? $item['title']);
                    $item['excerpt'] = trim($data['excerpt'] ?? $item['excerpt']);
                    $item['content'] = trim($data['content'] ?? $item['content']);
                    $item['date'] = trim($data['date'] ?? $item['date']);
                    $item['updatedAt'] = date('c');
                    
                    // Görseller güncellendi mi?
                    if (isset($data['images'])) {
                        // Eski görselleri sil
                        if (!empty($item['images'])) {
                            foreach ($item['images'] as $img) {
                                if (!in_array($img, $data['images'])) {
                                    deleteImage($img['src'] ?? '');
                                }
                            }
                        }
                        $item['images'] = $data['images'];
                    }
                    
                    $found = $item;
                    break;
                }
            }
            unset($item);
            
            if ($found) {
                if (saveNews($news)) {
                    echo json_encode(['success' => true, 'data' => $found, 'message' => 'Haber başarıyla güncellendi.']);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Haber güncellenemedi.']);
                }
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Haber bulunamadı.']);
            }
            break;
            
        case 'DELETE':
            // Haber sil
            $id = $_GET['id'] ?? '';
            
            if (empty($id)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Haber ID\'si zorunludur.']);
                exit;
            }
            
            $news = getNews();
            $found = false;
            $newNews = [];
            
            foreach ($news as $item) {
                if ($item['id'] === $id) {
                    $found = $item;
                    // Görselleri sil
                    if (!empty($item['images'])) {
                        foreach ($item['images'] as $img) {
                            deleteImage($img['src'] ?? '');
                        }
                    }
                } else {
                    $newNews[] = $item;
                }
            }
            
            if ($found) {
                if (saveNews($newNews)) {
                    echo json_encode(['success' => true, 'message' => 'Haber başarıyla silindi.']);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Haber silinemedi.']);
                }
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Haber bulunamadı.']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Desteklenmeyen HTTP metodu.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Sunucu hatası: ' . $e->getMessage()]);
}

