-- Schema do banco (PostgreSQL - Supabase)
-- Projeto: SaaS de Gestão de Produtos

-- PRODUTOS
CREATE TABLE public.produtos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50),
  nome VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_custo NUMERIC(10,2) NOT NULL,
  preco_venda NUMERIC(10,2) NOT NULL,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  imagemProduto TEXT,
  descricao TEXT
);

-- USUARIOS
CREATE TABLE public.usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VENDAS
CREATE TABLE public.vendas (
  id SERIAL PRIMARY KEY,
  cliente TEXT,
  forma_pagamento VARCHAR(50) NOT NULL,
  observacao TEXT,
  total NUMERIC(10,2) NOT NULL,
  data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VENDA_ITENS
CREATE TABLE public.venda_itens (
  id SERIAL PRIMARY KEY,
  venda_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_venda FOREIGN KEY (venda_id) REFERENCES public.vendas(id),
  CONSTRAINT fk_produto FOREIGN KEY (produto_id) REFERENCES public.produtos(id)
);