# Governança e classificação de dados

## Responsabilidade e finalidade

A Velas AIB atua como controladora dos dados cadastrados no ERP. O tratamento deve ser limitado à gestão comercial, emissão e comprovação de pedidos, atendimento ao cliente e cumprimento de obrigações legais ou regulatórias.

## Classificação

| Classe | Dados | Acesso | Retenção e descarte |
|---|---|---|---|
| Pública | Catálogo, categorias e preços padrão | Usuários autenticados | Enquanto o produto fizer parte do catálogo |
| Interna | Número, itens, quantidades, valores, descontos e status do pedido | Proprietário e administrador | Conforme necessidade comercial e fiscal |
| Pessoal | Nome, CPF/CNPJ de pessoa física, e-mail, telefone e identificação do vendedor | Proprietário e administrador | `DATA_RETENTION_DAYS`; depois, anonimização |
| Confidencial | Endereço, e-mail fiscal, observações e PDF do pedido | Proprietário e administrador | `DATA_RETENTION_DAYS`; depois, remoção ou anonimização |
| Secreta | Senhas, hashes, sessão, JWT, credenciais do banco e Redis | Somente infraestrutura autorizada | Rotação e revogação; nunca incluir em logs ou Git |

## Regras implementadas

- Clientes e pedidos são isolados pelo usuário proprietário.
- Exclusão e limpeza de histórico arquivam pedidos; não removem dados antes do prazo.
- Clientes desativados recebem uma data de término de retenção.
- Pedidos recebem `retentionUntil` na criação.
- Após o prazo, o comando de retenção rompe o vínculo com o cliente, anonimiza snapshots e remove o PDF.
- Itens e valores não pessoais permanecem para preservar histórico financeiro agregado.
- Colaboradores não criam nem alteram o catálogo global; produtos manuais continuam disponíveis nos próprios pedidos.
- Administradores do ERP não executam migrações, backups ou anonimização.
- O operador de infraestrutura não precisa possuir conta no ERP.
- Runtime, migração e governança usam credenciais de banco diferentes.
- Aprovações, alterações de catálogo, arquivamentos e acessos a PDFs geram registros em `audit_logs`.

## Separação de responsabilidades

| Responsável | Pode | Não pode |
|---|---|---|
| Colaborador | Gerenciar seus clientes e pedidos; gerar seus PDFs; usar produtos manuais | Ver dados de outro colaborador; alterar catálogo ou usuários |
| Administrador do ERP | Aprovar colaboradores; manter catálogo; visualizar indicadores globais; gerar PDFs autorizados | Executar migrações, acessar segredos, backups ou anonimização; limpar histórico de colaboradores |
| Operador de infraestrutura | Configurar Railway/Layerbase/Redis, executar migrações, backups e retenção | Operar pedidos e clientes pelo ERP sem uma conta própria autorizada |

As funções de administrador do ERP e operador de infraestrutura devem ser atribuídas a pessoas ou credenciais distintas.

## Operação

Simulação segura:

```bash
npm run data:retention
```

Aplicação efetiva após revisão:

```bash
npm run data:retention -- --apply
```

O prazo padrão é 1.825 dias e deve ser validado pela contabilidade ou assessoria jurídica. A LGPD não estabelece um prazo único; a finalidade e as obrigações legais aplicáveis devem orientar a configuração.
