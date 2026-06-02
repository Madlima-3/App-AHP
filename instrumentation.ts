export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prisma } = await import("@/lib/prisma");

    // Inicializa o banco SQLite se as tabelas não existirem (necessário em
    // ambientes serverless onde o arquivo .db é criado em /tmp e não persiste).
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "TipoAtivo" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "nome" TEXT NOT NULL,
          "descricao" TEXT,
          "maxPatologiasEsperadas" INTEGER NOT NULL DEFAULT 3,
          "pesoRelativoFuturo" REAL,
          "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "VersaoConfiguracao" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "tipoAtivoId" TEXT NOT NULL,
          "versao" INTEGER NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'rascunho',
          "notas" TEXT,
          "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("tipoAtivoId") REFERENCES "TipoAtivo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "VersaoConfiguracao_tipoAtivoId_versao_key"
        ON "VersaoConfiguracao"("tipoAtivoId", "versao")
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CriterioAtivo" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "versaoConfiguracaoId" TEXT NOT NULL,
          "nome" TEXT NOT NULL,
          "descricao" TEXT,
          "peso" REAL,
          "ordem" INTEGER NOT NULL,
          FOREIGN KEY ("versaoConfiguracaoId") REFERENCES "VersaoConfiguracao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "EscalaCriterioAtivo" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "criterioAtivoId" TEXT NOT NULL,
          "rotulo" TEXT NOT NULL,
          "valor" REAL NOT NULL,
          FOREIGN KEY ("criterioAtivoId") REFERENCES "CriterioAtivo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CriterioPatologia" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "versaoConfiguracaoId" TEXT NOT NULL,
          "nome" TEXT NOT NULL,
          "descricao" TEXT,
          "peso" REAL,
          "ordem" INTEGER NOT NULL,
          FOREIGN KEY ("versaoConfiguracaoId") REFERENCES "VersaoConfiguracao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "EscalaCriterioPatologia" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "criterioPatologiaId" TEXT NOT NULL,
          "rotulo" TEXT NOT NULL,
          "valor" REAL NOT NULL,
          FOREIGN KEY ("criterioPatologiaId") REFERENCES "CriterioPatologia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "MatrizAHP" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "versaoConfiguracaoId" TEXT NOT NULL,
          "tipo" TEXT NOT NULL,
          "dadosMatriz" TEXT NOT NULL,
          "indiceConsistencia" REAL,
          "razaoConsistencia" REAL,
          "valido" BOOLEAN NOT NULL DEFAULT 0,
          FOREIGN KEY ("versaoConfiguracaoId") REFERENCES "VersaoConfiguracao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
    } catch {
      // tabelas já existem ou outro erro não-crítico
    }
  }
}
