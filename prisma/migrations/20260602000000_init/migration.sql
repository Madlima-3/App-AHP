-- CreateTable
CREATE TABLE "TipoAtivo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "maxPatologiasEsperadas" INTEGER NOT NULL DEFAULT 3,
    "pesoRelativoFuturo" DOUBLE PRECISION,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoAtivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersaoConfiguracao" (
    "id" TEXT NOT NULL,
    "tipoAtivoId" TEXT NOT NULL,
    "versao" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "notas" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VersaoConfiguracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CriterioAtivo" (
    "id" TEXT NOT NULL,
    "versaoConfiguracaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "peso" DOUBLE PRECISION,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "CriterioAtivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalaCriterioAtivo" (
    "id" TEXT NOT NULL,
    "criterioAtivoId" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EscalaCriterioAtivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CriterioPatologia" (
    "id" TEXT NOT NULL,
    "versaoConfiguracaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "peso" DOUBLE PRECISION,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "CriterioPatologia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalaCriterioPatologia" (
    "id" TEXT NOT NULL,
    "criterioPatologiaId" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EscalaCriterioPatologia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatrizAHP" (
    "id" TEXT NOT NULL,
    "versaoConfiguracaoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dadosMatriz" TEXT NOT NULL,
    "indiceConsistencia" DOUBLE PRECISION,
    "razaoConsistencia" DOUBLE PRECISION,
    "valido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MatrizAHP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VersaoConfiguracao_tipoAtivoId_versao_key" ON "VersaoConfiguracao"("tipoAtivoId", "versao");

-- AddForeignKey
ALTER TABLE "VersaoConfiguracao" ADD CONSTRAINT "VersaoConfiguracao_tipoAtivoId_fkey" FOREIGN KEY ("tipoAtivoId") REFERENCES "TipoAtivo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriterioAtivo" ADD CONSTRAINT "CriterioAtivo_versaoConfiguracaoId_fkey" FOREIGN KEY ("versaoConfiguracaoId") REFERENCES "VersaoConfiguracao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalaCriterioAtivo" ADD CONSTRAINT "EscalaCriterioAtivo_criterioAtivoId_fkey" FOREIGN KEY ("criterioAtivoId") REFERENCES "CriterioAtivo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriterioPatologia" ADD CONSTRAINT "CriterioPatologia_versaoConfiguracaoId_fkey" FOREIGN KEY ("versaoConfiguracaoId") REFERENCES "VersaoConfiguracao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalaCriterioPatologia" ADD CONSTRAINT "EscalaCriterioPatologia_criterioPatologiaId_fkey" FOREIGN KEY ("criterioPatologiaId") REFERENCES "CriterioPatologia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatrizAHP" ADD CONSTRAINT "MatrizAHP_versaoConfiguracaoId_fkey" FOREIGN KEY ("versaoConfiguracaoId") REFERENCES "VersaoConfiguracao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
