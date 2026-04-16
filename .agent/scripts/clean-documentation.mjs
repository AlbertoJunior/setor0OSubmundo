import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { describe, it } from 'node:test';
import assert from 'node:assert';

export async function processFile(sourcePath, targetPath) {
    try {
        let content = await fs.readFile(sourcePath, 'utf-8');
        let initialLength = content.length;

        // Limpeza baseada no html fornecido do TypeDoc e ferramentas similares
        // 1. Extrair tudo de dentro de <div class="col-content"> até <div class="col-sidebar">
        const contentMatch = content.match(/<div class="col-content">([\s\S]*?)<div class="col-sidebar">/i);
        if (contentMatch) {
            content = `<div class="col-content">\n${contentMatch[1]}</div>`;
        }

        // 2. Limpar scripts ignorando case e novas linhas
        content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // 3. Limpar styles e links stylesheet globais
        content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
        content = content.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/gi, '');
        content = content.replace(/ style="[^"]*"/gi, ''); // in-line styles
        
        // 4. Limpar svgs (vector) e imagens, assim como requisitado
        content = content.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');
        content = content.replace(/<img\b[^>]*>/gi, '');

        content = content.trim();
        
        // Assegura que a pasta de destino exista
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, content, 'utf-8');
        
        return { success: true, initialLength, finalLength: content.length };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

export async function processDirectory(dirPath, outDirPath) {
    let filesProcessed = 0;
    try {
        // Assegura que o targetDir base exista
        if (outDirPath && !fsSync.existsSync(outDirPath)) {
             await fs.mkdir(outDirPath, { recursive: true });
        }

        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const sourcePath = path.join(dirPath, entry.name);
            const targetPath = outDirPath ? path.join(outDirPath, entry.name) : sourcePath;
            
            if (entry.isDirectory()) {
                filesProcessed += await processDirectory(sourcePath, targetPath);
            } else if (sourcePath.endsWith('.html')) {
                await processFile(sourcePath, targetPath);
                filesProcessed++;
            }
        }
    } catch(e) {
        console.error(`Erro ao processar o diretório ${dirPath}: ${e.message}`);
    }
    return filesProcessed;
}

export async function createIndexFile(targetDir, folderName) {
    const indexPath = path.join(targetDir, '_index.md');
    const today = new Date().toLocaleDateString('pt-BR');
    
    // Tenta encontrar quais arquivos HTML existem na raiz para criar uma tabela automática
    let entries = [];
    try {
        const files = await fs.readdir(targetDir, { withFileTypes: true });
        entries = files.filter(f => f.isFile() && f.name.endsWith('.html')).map(f => f.name);
    } catch (e) {
        /* ignore */
    }

    let extraRows = '';
    if (entries.includes('modules.html')) {
        extraRows += `\n| [modules.html](./modules.html) | Ponto de entrada (root) principal. Ele lista as demais Classes e Namespaces disponíveis. | ${today} |`;
    } else if (entries.includes('index.html')) {
         extraRows += `\n| [index.html](./index.html) | Arquivo de visão geral (root). | ${today} |`;
    }

    if (entries.includes('hierarchy.html')) {
        extraRows += `\n| [hierarchy.html](./hierarchy.html) | Árvore de heranças de classes da documentação. | ${today} |`;
    }

    const indexContent = `# Índice de Documentação - ${folderName}

Esta pasta contém a base gerada ou importada da documentação, que foi pré-processada pela skill \`clean-documentation\` para remover scripts, imagens, svgs e estilos irrelevantes. 
O principal objetivo é facilitar a indexação e a leitura rápida pelo Agente (economia de context/tokens).

| Arquivo Principal | Descrição | Última Atualização |
| :--- | :--- | :--- |${extraRows}

*Nota: Para explorar classes específicas, o modelo do Agent fará bucas diretas (\`find_by_name\` ou \`grep_search\`) dentro das pastas presentes nesta documentação.*
`;
    await fs.writeFile(indexPath, indexContent, 'utf-8');
}

// Quando o arquivo for executado diretamente como CLI ou Skill
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
    const isTest = process.argv.includes('--test') || process.env.NODE_ENV === 'test';
    
    // Deixamos a execução passar direto se for o node:test running natively, 
    // afinal ele mesmo executa os blocos 'describe' abaixo
    if (!isTest && typeof process.argv[2] === 'string' && !process.argv[2].startsWith('-')) {
        const rawArgs = process.argv.slice(2);
        const folderName = rawArgs[0];
        
        if (!folderName) {
            console.error('Por favor, informe o nome da pasta de origem em .agent/docs/ (Ex: v13)');
            process.exit(1);
        }
        
        let targetFolderName = folderName;
        const outIdx = rawArgs.indexOf('--output');
        if (outIdx !== -1 && rawArgs[outIdx + 1]) {
             targetFolderName = rawArgs[outIdx + 1];
        }

        const sourceDir = path.join(process.cwd(), '.agent', 'docs', folderName);
        const targetDir = path.join(process.cwd(), '.agent', 'docs', targetFolderName);

        if (!fsSync.existsSync(sourceDir)) {
             console.error(`Diretório origem '${sourceDir}' não existe na base de documentações (.agent/docs/).`);
             process.exit(1);
        }

        console.log(`[Clean-Documentation Skill] Iniciando limpeza...`);
        console.log(` -> Origem:  ${sourceDir}`);
        console.log(` -> Destino: ${targetDir}`);
        
        processDirectory(sourceDir, targetDir).then(async (filesRes) => {
             console.log(`[Clean-Documentation Skill] Processados e formatados ${filesRes} arquivos .html.`);
             await createIndexFile(targetDir, targetFolderName);
             console.log(`[Clean-Documentation Skill] Arquivo _index.md sincronizado para pasta: ${targetFolderName}`);
        });
    }
}

// ============================================
// Área de Testes Unitários
// ============================================

describe('Clean-Documentation Skill Tests', () => {

    it('Deve extrair <div class="col-content">, remover SVG/scripts/styles permitindo output customizado (-cleaned)', async () => {
        const oldFile = path.join(process.cwd(), '.agent', 'docs', 'v13-old', 'index.html');
        
        if (!fsSync.existsSync(oldFile)) {
             console.log('[-] v13-old/index.html não existe no disco - Ignorando o mock exato de limpeza.');
             return;
        }

        const tempSrcPath = path.join(process.cwd(), '.agent', 'scripts', 'temp-test-src.html');
        const tempDestPath = path.join(process.cwd(), '.agent', 'scripts', 'temp-test-dest.html');
        
        const oldContent = await fs.readFile(oldFile, 'utf-8');
        await fs.writeFile(tempSrcPath, oldContent);
        
        // Chamamos passando Paths diferentes
        const result = await processFile(tempSrcPath, tempDestPath);
        assert.strictEqual(result.success, true);
        
        const processedContent = await fs.readFile(tempDestPath, 'utf-8');
        
        // Asserts do destino isolado
        assert.ok(!processedContent.includes('<script'), 'Scripts presentes após limpeza!');
        assert.ok(!processedContent.includes('<style'), 'Tags <style> presentes após limpeza!');
        assert.ok(!processedContent.includes('<svg'), 'Tags <svg> presentes após limpeza!');
        assert.ok(!processedContent.includes('col-sidebar'), 'Área col-sidebar não foi removida via regex!');
        assert.ok(processedContent.includes('col-content'), 'A classe root principal col-content sumiu!');
        
        assert.ok(processedContent.length < oldContent.length, 'O arquivo processado não reduziu de tamanho!');

        await fs.unlink(tempSrcPath);
        await fs.unlink(tempDestPath);
    });

});
