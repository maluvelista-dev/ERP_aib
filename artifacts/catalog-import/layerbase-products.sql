-- Catálogo Velas AIB / Tabela Comercial Abril 2026
-- 18 categorias e 159 produtos
-- Compatível com MySQL/MariaDB e seguro para reexecução.
-- Execute as migrations do Prisma antes deste arquivo.

SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO `product_categories`
  (`id`, `name`, `slug`, `description`, `active`, `createdAt`, `updatedAt`)
VALUES
  (UUID(), 'Velas Maço', 'velas-maco', 'Linha de maços de velas brancas e coloridas.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Velas Votivas', 'velas-votivas', 'Velas votivas tradicionais, novena e longa duração.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Votiva PVC Santo', 'votiva-pvc-santo', 'Velas votivas em PVC com imagem de santos.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Votiva Cores', 'votiva-cores', 'Velas votivas coloridas e sete cores.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Velas Comuns', 'velas-comuns', 'Velas comuns por medida e uso diário.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Velas Sacramentais', 'velas-sacramentais', 'Velas para batismo, crisma e primeira comunhão.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Velas de Altar e Eucaristia', 'velas-de-altar-e-eucaristia', 'Velas maiores para altar, celebrações e uso religioso.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Lamparinas', 'lamparinas', 'Lamparinas, refis e velas pequenas relacionadas.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Velas Avulsas', 'velas-avulsas', 'Velas vendidas avulsas ou por quilo.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Linha Premium', 'linha-premium', 'Produtos decorativos e linhas especiais.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Velas Copo', 'velas-copo', 'Velas em copo tradicionais.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Velas Votivas Apelos', 'velas-votivas-apelos', 'Votivas de apelos como amor, paz, mau olhado e abre caminho.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Velas Copo Aroma', 'velas-copo-aroma', 'Velas em copo aromáticas.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Life Oil', 'life-oil', 'Óleo mineral Life Oil.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Óleo de Citronela', 'oleo-de-citronela', 'Linha Citrolife e citronela.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Tocheiros', 'tocheiros', 'Lata, pavio e acessórios para tocheiro.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Velas Citronela', 'velas-citronela', 'Velas e lamparinas de citronela.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'Luminárias', 'luminarias', 'Luminárias decorativas quadradas, retangulares e cilíndricas.', TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `active` = TRUE,
  `updatedAt` = CURRENT_TIMESTAMP(3);

INSERT INTO `products`
  (`id`, `code`, `name`, `category`, `categoryId`, `description`, `unitPrice`, `boxPrice`, `active`, `createdAt`, `updatedAt`)
VALUES
  (UUID(), '7898908838435', 'MAÇO N° 04 – 120 GR BRANCA', 'Velas Maço', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-maco' LIMIT 1), 'Embalagem: 24X8', 4.50, 108.00, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838442', 'MAÇO N° 05 – 175 GR BRANCA', 'Velas Maço', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-maco' LIMIT 1), 'Embalagem: 24X8', 5.90, 141.60, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838459', 'MAÇO N° 06 – 215 GR BRANCA', 'Velas Maço', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-maco' LIMIT 1), 'Embalagem: 24X8', 7.30, 175.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838473', 'MAÇO N° 08 – 245 GR BRANCA', 'Velas Maço', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-maco' LIMIT 1), 'Embalagem: 24X8', 8.20, 196.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837612', 'MAÇO No 12 – 300 GR BRANCA', 'Velas Maço', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-maco' LIMIT 1), 'Embalagem: 12X6', 10.60, 127.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838992', 'MAÇO No 15 - 480 GR BRANCA', 'Velas Maço', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-maco' LIMIT 1), 'Embalagem: 12X6', 15.70, 188.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908831368', 'MAÇO N° 06 – 215 GR MEL', 'Velas Maço', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-maco' LIMIT 1), 'Embalagem: 24X8', 9.40, 225.60, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833911', 'MAÇO N° 06 – 215 GR CANELA', 'Velas Maço', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-maco' LIMIT 1), 'Embalagem: 24X8', 9.40, 225.60, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833898', 'MAÇO N° 06 – 215 GR FIGO', 'Velas Maço', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-maco' LIMIT 1), 'Embalagem: 24X8', 9.40, 225.60, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833904', 'MAÇO N° 06 – 215 GR BAUNILHA', 'Velas Maço', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-maco' LIMIT 1), 'Embalagem: 24X8', 9.40, 225.60, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838398', 'VOTIVA 42 mm – 180 GR', 'Velas Votivas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas' LIMIT 1), 'Embalagem: 24X1', 6.70, 160.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838015', 'VOTIVA 50 mm – 250 GR', 'Velas Votivas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908832914', 'VOTIVA 50 mm – 220 GR PVC', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838190', 'VOTIVA 50 mm – 250 GR 7 CORES', 'Votiva Cores', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-cores' LIMIT 1), 'Embalagem: 24X1', 10.20, 244.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838206', 'VOTIVA 57 mm – 310 GR', 'Velas Votivas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas' LIMIT 1), 'Embalagem: 24X1', 10.60, 254.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-001', 'VOTIVA 63 mm – 400 GR', 'Velas Votivas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas' LIMIT 1), NULL, 12.50, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838817', 'VOTIVA NOVENA – 380 GR', 'Velas Votivas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas' LIMIT 1), 'Embalagem: 12X1', 12.50, 150.00, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898931507162', 'VOTIVA 21 DIAS – 1,850 KG', 'Velas Votivas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas' LIMIT 1), 'Embalagem: 6X1', 58.60, 351.60, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-002', 'VELA AVULSA POR QUILO', 'Velas Avulsas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-avulsas' LIMIT 1), NULL, 26.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833621', 'VELA COPO 3 DIAS', 'Velas Copo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo' LIMIT 1), 'Embalagem: 48X1', 4.40, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908832365', 'VELA COPO 24 HORAS', 'Velas Copo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo' LIMIT 1), 'Embalagem: 48X1', 4.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-003', 'VELA 5 DIAS 175 GR', 'Velas Comuns', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-comuns' LIMIT 1), 'Embalagem: 24X1', 6.30, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-004', 'VELA DE BATISMO COM ADESIVO', 'Velas Sacramentais', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-sacramentais' LIMIT 1), NULL, 3.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-005', 'VELA LAMPARINA LATA – 14g', 'Lamparinas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'lamparinas' LIMIT 1), NULL, 1.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-006', 'VELA LAMPARINA 2 CM - 14g', 'Lamparinas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'lamparinas' LIMIT 1), NULL, 0.70, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-007', 'VELA LAMPARINA 3 CM – 24g', 'Lamparinas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'lamparinas' LIMIT 1), NULL, 0.80, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-008', 'VELA LAMPARINA 4 CM – 34g', 'Lamparinas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'lamparinas' LIMIT 1), NULL, 1.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-009', 'VELA LAMPARINA 5 CM – 40g', 'Lamparinas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'lamparinas' LIMIT 1), NULL, 1.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-010', 'VELA CILINDRICA 4 X 5 – 60g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), NULL, 2.10, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-011', 'VELA CILINDRICA 5 X 3 – 50g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), NULL, 2.10, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-012', 'VELA CILINDRICA 5 X 4 – 70g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), NULL, 2.60, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-013', 'VELA CILINDRICA 5 X 5 – 88g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), NULL, 2.90, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837025', 'APARECIDA', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837032', 'SAGRADO CORAÇÃO DE JESUS', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837049', 'SANTA TEREZINHA', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837056', 'SANTA EDWIGES', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837063', 'JESUS CRISTO', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837070', 'FATIMA', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837087', 'DESATADORA DOS NÓS', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837094', 'LOURDES', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `category` = VALUES(`category`),
  `categoryId` = VALUES(`categoryId`),
  `description` = VALUES(`description`),
  `unitPrice` = VALUES(`unitPrice`),
  `boxPrice` = VALUES(`boxPrice`),
  `active` = VALUES(`active`),
  `updatedAt` = CURRENT_TIMESTAMP(3);

INSERT INTO `products`
  (`id`, `code`, `name`, `category`, `categoryId`, `description`, `unitPrice`, `boxPrice`, `active`, `createdAt`, `updatedAt`)
VALUES
  (UUID(), '7898908837100', 'SÃO JORGE', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837117', 'SAGRADA FAMILIA', 'Velas Comuns', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-comuns' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837124', 'ANJO DA GUARDA', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837131', 'SENHORA DAS GRAÇAS', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837148', 'RITA DE CASSIA', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837155', 'SAGRADO CORAÇÃO DE MARIA', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837162', 'SENHORA DA PAZ', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837179', 'SANTO ANTONIO', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837186', 'SANTO EXPEDITO', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908837193', 'SÃO JUDAS', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833256', 'SAO JOSE', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908832457', 'DINO ESPIRITO SANTO', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908832440', 'SAO MIGUEL', 'Votiva PVC Santo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'votiva-pvc-santo' LIMIT 1), 'Embalagem: 24X1', 8.30, 199.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833874', 'VELA VOTIVA BAUNILHA 250 GR', 'Velas Votivas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas' LIMIT 1), 'Embalagem: 12X1', 10.20, 122.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833881', 'VELA VOTIVA CANELA 250 GR', 'Velas Votivas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas' LIMIT 1), 'Embalagem: 12X1', 10.20, 122.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833867', 'VELA VOTIVA FIGO 250 GR', 'Velas Votivas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas' LIMIT 1), 'Embalagem: 12X1', 10.20, 122.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838183', 'VELA VOTIVA MEL 250 GR', 'Velas Votivas', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas' LIMIT 1), 'Embalagem: 12X1', 10.20, 122.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833348', 'VELA VOTIVA DINHEIRO / CANELA 220 GR', 'Velas Votivas Apelos', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas-apelos' LIMIT 1), 'Embalagem: 12X1', 10.20, 122.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833386', 'VELA VOTIVA MAU OLHADO / ARRUDA 220 GR', 'Velas Votivas Apelos', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas-apelos' LIMIT 1), 'Embalagem: 12X1', 10.20, 122.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833331', 'VELA VOTIVA INVEJA / ALFAZEMA 220 GR', 'Velas Votivas Apelos', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas-apelos' LIMIT 1), 'Embalagem: 12X1', 10.20, 122.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833393', 'VELA VOTIVA AMOR / ROSA VERMELHA 220 GR', 'Velas Votivas Apelos', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas-apelos' LIMIT 1), 'Embalagem: 12X1', 10.20, 122.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833355', 'VELA VOTIVA ABRE CAMINHO / CRAVO 220 GR', 'Velas Votivas Apelos', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas-apelos' LIMIT 1), 'Embalagem: 12X1', 10.20, 122.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833362', 'VELA VOTIVA PAZ / ROSA BRANCA 220 GR', 'Velas Votivas Apelos', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-votivas-apelos' LIMIT 1), 'Embalagem: 12X1', 10.20, 122.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908830026', 'VELA AROMA 90GR BAUNILHA COM LARANJA', 'Velas Copo Aroma', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo-aroma' LIMIT 1), 'Embalagem: 6X1', 7.80, 46.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833249', 'VELA AROMA 90GR CITRONELA', 'Velas Copo Aroma', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo-aroma' LIMIT 1), 'Embalagem: 6X1', 7.80, 46.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908830019', 'VELA AROMA 90GR FRUTAS VERMELHAS', 'Velas Copo Aroma', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo-aroma' LIMIT 1), 'Embalagem: 6X1', 7.80, 46.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908830033', 'VELA AROMA 90GR LAVANDA PROVENCE', 'Velas Copo Aroma', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo-aroma' LIMIT 1), 'Embalagem: 6X1', 7.80, 46.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908830040', 'VELA AROMA 90GR CAPIM LIMÃO', 'Velas Copo Aroma', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo-aroma' LIMIT 1), 'Embalagem: 6X1', 7.80, 46.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-014', 'VELA ALTAR 7 X 15 – 500g', 'Velas de Altar e Eucaristia', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-de-altar-e-eucaristia' LIMIT 1), NULL, 19.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-015', 'VELA ALTAR 7 X 20 – 750g', 'Velas de Altar e Eucaristia', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-de-altar-e-eucaristia' LIMIT 1), NULL, 25.60, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-016', 'VELA ALTAR 7 X 30 – 1.000g', 'Velas de Altar e Eucaristia', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-de-altar-e-eucaristia' LIMIT 1), NULL, 38.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-017', 'VELA 2,5 X 30', 'Velas Comuns', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-comuns' LIMIT 1), NULL, 5.10, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-018', 'VELA 2,5 X 40', 'Velas Comuns', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-comuns' LIMIT 1), NULL, 7.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-019', 'VELA 3 X 30', 'Velas Comuns', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-comuns' LIMIT 1), NULL, 7.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-020', 'VELA 3 X 40', 'Velas Comuns', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-comuns' LIMIT 1), NULL, 9.60, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838978', 'CITROLIFE LAMPARINA', 'Velas Citronela', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-citronela' LIMIT 1), 'Embalagem: 12X6', 12.00, 144.00, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-021', 'CITROLIFE VELA COPO 100 GR', 'Velas Citronela', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-citronela' LIMIT 1), 'Embalagem: 12X1 | Codigo original: 7898908833249', 7.90, 94.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838763', 'CITROLIFE VELA COM 2 UNIDADES', 'Óleo de Citronela', (SELECT `id` FROM `product_categories` WHERE `slug` = 'oleo-de-citronela' LIMIT 1), 'Embalagem: 12X2', 15.90, 190.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838787', 'CITROLIFE 500 ML', 'Óleo de Citronela', (SELECT `id` FROM `product_categories` WHERE `slug` = 'oleo-de-citronela' LIMIT 1), 'Embalagem: 12X1', 19.70, 236.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838794', 'CITROLIFE 1 LITRO', 'Óleo de Citronela', (SELECT `id` FROM `product_categories` WHERE `slug` = 'oleo-de-citronela' LIMIT 1), 'Embalagem: 12X1', 34.50, 414.00, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `category` = VALUES(`category`),
  `categoryId` = VALUES(`categoryId`),
  `description` = VALUES(`description`),
  `unitPrice` = VALUES(`unitPrice`),
  `boxPrice` = VALUES(`boxPrice`),
  `active` = VALUES(`active`),
  `updatedAt` = CURRENT_TIMESTAMP(3);

INSERT INTO `products`
  (`id`, `code`, `name`, `category`, `categoryId`, `description`, `unitPrice`, `boxPrice`, `active`, `createdAt`, `updatedAt`)
VALUES
  (UUID(), '7898908838800', 'CITROLIFE 5 LITROS', 'Óleo de Citronela', (SELECT `id` FROM `product_categories` WHERE `slug` = 'oleo-de-citronela' LIMIT 1), 'Embalagem: 2X1', 146.60, 293.60, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838961', 'LIFE OIL 500 ml', 'Life Oil', (SELECT `id` FROM `product_categories` WHERE `slug` = 'life-oil' LIMIT 1), 'Embalagem: 12X1', 14.90, 178.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838985', 'LIFE OIL 1 Litro', 'Life Oil', (SELECT `id` FROM `product_categories` WHERE `slug` = 'life-oil' LIMIT 1), 'Embalagem: 12X1', 27.00, 324.00, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838954', 'LIFE OIL 5 Litros', 'Life Oil', (SELECT `id` FROM `product_categories` WHERE `slug` = 'life-oil' LIMIT 1), 'Embalagem: 2X1', 130.90, 261.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838909', 'LATA PARA TOCHEIRO', 'Tocheiros', (SELECT `id` FROM `product_categories` WHERE `slug` = 'tocheiros' LIMIT 1), 'Embalagem: 6X1', 10.90, 65.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908838824', 'PAVIO PARA TOCHEIRO', 'Tocheiros', (SELECT `id` FROM `product_categories` WHERE `slug` = 'tocheiros' LIMIT 1), 'Embalagem: 12X2', 6.10, 73.20, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833836', 'VELA 3,5 X 3,5 COM 10 ACETATO', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 24X10', 18.60, 446.40, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908832945', 'VELA 2 X 26 CASTIÇAL COM 2 ACETATO', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 25X2', 9.60, 240.00, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908836776', 'VELA 5X5 COM 6 ACETATO', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 12X6', 21.50, 258.00, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908832006', 'VELA BOLA 08 COM 1 ACETATO', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 24X1', 13.20, 316.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908833829', 'VELA BOLA 06 COM 3 ACETATO', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 20X3', 15.20, 304.00, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908839197', 'VELA FLUTUANTE 06 COM 3 ACETATO', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 20X3', 15.10, 302.00, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-022', 'VELA COPO LISO', 'Velas Copo', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo' LIMIT 1), 'Embalagem: 30X1', 12.80, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908839302', 'RECHAUD COM 10 UNIDADES', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 24X10', 11.00, 264.00, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908840063', 'VELA COPO LISO CANELA', 'Velas Copo Aroma', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo-aroma' LIMIT 1), 'Embalagem: 6X1', 16.80, 100.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908840070', 'VELA COPO LISO BAMBOO', 'Velas Copo Aroma', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo-aroma' LIMIT 1), 'Embalagem: 6X1', 16.80, 100.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908840087', 'VELA COPO LISO BLUEBERRY', 'Velas Copo Aroma', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo-aroma' LIMIT 1), 'Embalagem: 6X1', 16.80, 100.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908840100', 'VELA COPO LISO BAUNILHA', 'Velas Copo Aroma', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo-aroma' LIMIT 1), 'Embalagem: 6X1', 16.80, 100.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), '7898908840094', 'VELA COPO LISO FLORAL', 'Velas Copo Aroma', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-copo-aroma' LIMIT 1), 'Embalagem: 6X1', 16.80, 100.80, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-023', 'LUMINÁRIA QUADRADA 8X8X8', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 7.80, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-024', 'LUMINÁRIA QUADRADA 10X10X10', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 11.40, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-025', 'LUMINÁRIA QUADRADA 12X12X12', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 19.80, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-026', 'LUMINÁRIA QUADRADA 15X15X15', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 35.30, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-027', 'LUMINÁRIA QUADRADA 20X20X20', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 76.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-028', 'LUMINÁRIA BOLA 15', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 26.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-029', 'LUMINÁRIA BOLA 20', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 56.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-030', 'LUMINÁRIA BOLA 25', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 87.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-031', 'LUMINÁRIA BOLA 30', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 116.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-032', 'LUMINÁRIA RETANGULAR 12X12X20', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 29.80, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-033', 'LUMINÁRIA RETANGULAR 12X12X25', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 48.80, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-034', 'LUMINÁRIA RETANGULAR 12X12X30', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 55.40, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-035', 'LUMINÁRIA RETANGULAR 15X15X20', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 44.90, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-036', 'LUMINÁRIA RETANGULAR 15X15X30', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 72.60, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-037', 'LUMINÁRIA RETANGULAR 15X15X40', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 103.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-038', 'LUMINÁRIA RETANGULAR 15X15X50', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 138.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-039', 'LUMINÁRIA RETANGULAR 20X20X30', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 116.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-040', 'LUMINÁRIA RETANGULAR 20X20X40', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 165.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-041', 'LUMINÁRIA RETANGULAR 20X20X50', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), NULL, 191.40, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-042', 'LUMINÁRIA CILINDRICA', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), 'Embalagem: 12X10', 18.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-043', 'LUMINÁRIA CILINDRICA', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), 'Embalagem: 12X15', 21.60, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `category` = VALUES(`category`),
  `categoryId` = VALUES(`categoryId`),
  `description` = VALUES(`description`),
  `unitPrice` = VALUES(`unitPrice`),
  `boxPrice` = VALUES(`boxPrice`),
  `active` = VALUES(`active`),
  `updatedAt` = CURRENT_TIMESTAMP(3);

INSERT INTO `products`
  (`id`, `code`, `name`, `category`, `categoryId`, `description`, `unitPrice`, `boxPrice`, `active`, `createdAt`, `updatedAt`)
VALUES
  (UUID(), 'AIB-044', 'LUMINÁRIA CILINDRICA', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), 'Embalagem: 12X20', 27.30, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-045', 'LUMINÁRIA CILINDRICA', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), 'Embalagem: 12X25', 52.80, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-046', 'LUMINÁRIA CILINDRICA', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), 'Embalagem: 12X30', 60.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-047', 'LUMINÁRIA CILINDRICA', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), 'Embalagem: 14X14', 22.80, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-048', 'LUMINÁRIA CILINDRICA', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), 'Embalagem: 14X20', 36.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-049', 'LUMINÁRIA CILINDRICA', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), 'Embalagem: 14X30', 66.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-050', 'LUMINÁRIA CILINDRICA', 'Luminárias', (SELECT `id` FROM `product_categories` WHERE `slug` = 'luminarias' LIMIT 1), 'Embalagem: 14X40', 99.60, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-051', 'VELA QUADRADA 65 X 07 – 250g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 24X1', 11.30, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-052', 'VELA QUADRADA 65 X 10 – 380g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 12X1', 14.30, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-053', 'VELA QUADRADA 65 X 15 – 590g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 12X1', 20.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-054', 'VELA QUADRADA 65 X 18', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 12X1', 37.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-055', 'VELA QUADRADA 95 X 07', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 6X1', 19.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-056', 'VELA QUADRADA 95 X 10', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 6X1', 27.60, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-057', 'VELA QUADRADA 95 X 12', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 6X1', 32.40, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-058', 'VELA QUADRADA 95 X 15', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 6X1', 39.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-059', 'VELA QUADRADA 95 X 18', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 6X1', 41.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-060', 'VELA CILINDRICA 63 X 07 – 200g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 24X1', 7.90, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-061', 'VELA CILINDRICA 63 X 09 – 250g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 12X1', 11.20, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-062', 'VELA CILINDRICA 63 X 14 – 405g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 12X1', 17.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-063', 'VELA CILINDRICA 63 X 17 – 530g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 12X1', 19.60, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-064', 'VELA CILINDRICA 80 X 07 – 290g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 12X1', 12.30, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-065', 'VELA CILINDRICA 80 X 10 – 430g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 12X1', 16.10, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-066', 'VELA CILINDRICA 80 X 15 – 570g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 12X1', 21.50, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-067', 'VELA CILINDRICA 80 X 20', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 12X1', 30.30, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-068', 'VELA CILINDRICA 95 X 07 – 500g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 6X1', 17.10, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-069', 'VELA CILINDRICA 95 X 12 – 700g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 6X1', 26.30, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-070', 'VELA CILINDRICA 95 X 18 – 1.000g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 6X1', 37.30, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-071', 'VELA CILINDRICA 120 X 10', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 6X1', 34.80, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-072', 'VELA CILINDRICA 120 X 15', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 6X1', 48.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-073', 'VELA CILINDRICA 120 X 20', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 6X1', 59.50, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-074', 'VELA BOLA 06 – 100g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), NULL, 3.50, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-075', 'VELA BOLA 08 – 190g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), NULL, 6.70, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-076', 'VELA BOLA 10 – 380g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), NULL, 13.80, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-077', 'VELA FLUTUANTE 63 X 35 – 90g', 'Linha Premium', (SELECT `id` FROM `product_categories` WHERE `slug` = 'linha-premium' LIMIT 1), 'Embalagem: 3X1', 3.80, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-078', 'VELA ALTAR 9,5 X 20 – 1,230g', 'Velas de Altar e Eucaristia', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-de-altar-e-eucaristia' LIMIT 1), NULL, 42.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-079', 'VELA ALTAR 9,5 X 30 – 1,850g', 'Velas de Altar e Eucaristia', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-de-altar-e-eucaristia' LIMIT 1), NULL, 63.60, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-080', 'VELA ALTAR 9,5 X 40 – 2,460g', 'Velas de Altar e Eucaristia', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-de-altar-e-eucaristia' LIMIT 1), NULL, 84.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-081', 'VELA ALTAR 9,5 X 50 – 3,080g', 'Velas de Altar e Eucaristia', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-de-altar-e-eucaristia' LIMIT 1), NULL, 106.80, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (UUID(), 'AIB-082', 'VELA ALTAR 9,5 X 60 – 3,700g', 'Velas de Altar e Eucaristia', (SELECT `id` FROM `product_categories` WHERE `slug` = 'velas-de-altar-e-eucaristia' LIMIT 1), NULL, 120.00, NULL, TRUE, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `category` = VALUES(`category`),
  `categoryId` = VALUES(`categoryId`),
  `description` = VALUES(`description`),
  `unitPrice` = VALUES(`unitPrice`),
  `boxPrice` = VALUES(`boxPrice`),
  `active` = VALUES(`active`),
  `updatedAt` = CURRENT_TIMESTAMP(3);

COMMIT;

-- Conferência
SELECT COUNT(*) AS `catalog_products_found`
FROM `products`
WHERE `code` IN ('7898908838435', '7898908838442', '7898908838459', '7898908838473', '7898908837612', '7898908838992', '7898908831368', '7898908833911', '7898908833898', '7898908833904', '7898908838398', '7898908838015', '7898908832914', '7898908838190', '7898908838206', 'AIB-001', '7898908838817', '7898931507162', 'AIB-002', '7898908833621', '7898908832365', 'AIB-003', 'AIB-004', 'AIB-005', 'AIB-006', 'AIB-007', 'AIB-008', 'AIB-009', 'AIB-010', 'AIB-011', 'AIB-012', 'AIB-013', '7898908837025', '7898908837032', '7898908837049', '7898908837056', '7898908837063', '7898908837070', '7898908837087', '7898908837094', '7898908837100', '7898908837117', '7898908837124', '7898908837131', '7898908837148', '7898908837155', '7898908837162', '7898908837179', '7898908837186', '7898908837193', '7898908833256', '7898908832457', '7898908832440', '7898908833874', '7898908833881', '7898908833867', '7898908838183', '7898908833348', '7898908833386', '7898908833331', '7898908833393', '7898908833355', '7898908833362', '7898908830026', '7898908833249', '7898908830019', '7898908830033', '7898908830040', 'AIB-014', 'AIB-015', 'AIB-016', 'AIB-017', 'AIB-018', 'AIB-019', 'AIB-020', '7898908838978', 'AIB-021', '7898908838763', '7898908838787', '7898908838794', '7898908838800', '7898908838961', '7898908838985', '7898908838954', '7898908838909', '7898908838824', '7898908833836', '7898908832945', '7898908836776', '7898908832006', '7898908833829', '7898908839197', 'AIB-022', '7898908839302', '7898908840063', '7898908840070', '7898908840087', '7898908840100', '7898908840094', 'AIB-023', 'AIB-024', 'AIB-025', 'AIB-026', 'AIB-027', 'AIB-028', 'AIB-029', 'AIB-030', 'AIB-031', 'AIB-032', 'AIB-033', 'AIB-034', 'AIB-035', 'AIB-036', 'AIB-037', 'AIB-038', 'AIB-039', 'AIB-040', 'AIB-041', 'AIB-042', 'AIB-043', 'AIB-044', 'AIB-045', 'AIB-046', 'AIB-047', 'AIB-048', 'AIB-049', 'AIB-050', 'AIB-051', 'AIB-052', 'AIB-053', 'AIB-054', 'AIB-055', 'AIB-056', 'AIB-057', 'AIB-058', 'AIB-059', 'AIB-060', 'AIB-061', 'AIB-062', 'AIB-063', 'AIB-064', 'AIB-065', 'AIB-066', 'AIB-067', 'AIB-068', 'AIB-069', 'AIB-070', 'AIB-071', 'AIB-072', 'AIB-073', 'AIB-074', 'AIB-075', 'AIB-076', 'AIB-077', 'AIB-078', 'AIB-079', 'AIB-080', 'AIB-081', 'AIB-082');

