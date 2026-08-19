-- Execute como proprietário do banco e substitua as senhas antes de usar.
-- Não reutilize nenhuma destas credenciais entre processos.

CREATE USER IF NOT EXISTS 'erp_runtime'@'%' IDENTIFIED BY 'SUBSTITUA_RUNTIME';
CREATE USER IF NOT EXISTS 'erp_migrator'@'%' IDENTIFIED BY 'SUBSTITUA_MIGRATOR';
CREATE USER IF NOT EXISTS 'erp_governance'@'%' IDENTIFIED BY 'SUBSTITUA_GOVERNANCE';

-- Aplicação web: somente operações necessárias ao funcionamento.
GRANT SELECT, INSERT, UPDATE, DELETE ON `aibvelas`.`users` TO 'erp_runtime'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `aibvelas`.`customers` TO 'erp_runtime'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `aibvelas`.`products` TO 'erp_runtime'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `aibvelas`.`product_categories` TO 'erp_runtime'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `aibvelas`.`orders` TO 'erp_runtime'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `aibvelas`.`order_items` TO 'erp_runtime'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `aibvelas`.`web_sessions` TO 'erp_runtime'@'%';
GRANT INSERT ON `aibvelas`.`audit_logs` TO 'erp_runtime'@'%';

-- Migrações: DDL, sem GRANT OPTION e usada somente pelo operador de infraestrutura.
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, REFERENCES
  ON `aibvelas`.* TO 'erp_migrator'@'%';

-- Governança: consulta e anonimização, sem administrar usuários ou estrutura.
GRANT SELECT, UPDATE ON `aibvelas`.`orders` TO 'erp_governance'@'%';
GRANT SELECT, UPDATE ON `aibvelas`.`customers` TO 'erp_governance'@'%';
GRANT INSERT ON `aibvelas`.`audit_logs` TO 'erp_governance'@'%';

FLUSH PRIVILEGES;
