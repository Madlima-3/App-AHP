-- CreateTable
CREATE TABLE "TipoAtivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "maxPatologiasEsperadas" INTEGER NOT NULL DEFAULT 3,
    "pesoRelativoFuturo" REAL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VersaoConfiguracao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipoAtivoId" TEXT NOT NULL,
    "versao" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "notas" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VersaoConfiguracao_tipoAtivoId_fkey" FOREIGN KEY ("tipoAtivoId") REFERENCES "TipoAtivo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CriterioAtivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versaoConfiguracaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "peso" REAL,
    "ordem" INTEGER NOT NULL,
    CONSTRAINT "CriterioAtivo_versaoConfiguracaoId_fkey" FOREIGN KEY ("versaoConfiguracaoId") REFERENCES "VersaoConfiguracao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EscalaCriterioAtivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "criterioAtivoId" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    CONSTRAINT "EscalaCriterioAtivo_criterioAtivoId_fkey" FOREIGN KEY ("criterioAtivoId") REFERENCES "CriterioAtivo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CriterioPatologia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versaoConfiguracaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "peso" REAL,
    "ordem" INTEGER NOT NULL,
    CONSTRAINT "CriterioPatologia_versaoConfiguracaoId_fkey" FOREIGN KEY ("versaoConfiguracaoId") REFERENCES "VersaoConfiguracao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EscalaCriterioPatologia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "criterioPatologiaId" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    CONSTRAINT "EscalaCriterioPatologia_criterioPatologiaId_fkey" FOREIGN KEY ("criterioPatologiaId") REFERENCES "CriterioPatologia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatrizAHP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versaoConfiguracaoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dadosMatriz" TEXT NOT NULL,
    "indiceConsistencia" REAL,
    "razaoConsistencia" REAL,
    "valido" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MatrizAHP_versaoConfiguracaoId_fkey" FOREIGN KEY ("versaoConfiguracaoId") REFERENCES "VersaoConfiguracao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VersaoConfiguracao_tipoAtivoId_versao_key" ON "VersaoConfiguracao"("tipoAtivoId", "versao");
