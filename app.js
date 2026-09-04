const numeroWhatsApp = "5527997367867";

const urlPlanilha =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQB3xpKv0dLdsU2QILj7Hjh4egbxidl4rxvH6U_l7QUFuPY1dImQj8_JpgFs0c5C8qe1wzc4swXR5EP/pub?output=csv";

let sacola = [];

function formatarUrlImagem(url) {
    if (!url || url.trim() === "") {
        return "https://via.placeholder.com/300x220?text=Sem+Foto";
    }
    url = url.trim();
    if (url.includes("drive.google.com")) {
        const idMatch = url.match(/[-\w]{25,}/);
        if (idMatch) {
            return `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
        }
    }
    return url;
}

async function carregarProdutos() 
    {
        try {
            const response =
                await fetch(
                    urlPlanilha +
                    "&nocache=" +
                    new Date().getTime()
                );
            const data = await response.text();
            const linhas =
                data
                .split("\n")
                .map(r => r.trim())
                .filter(r => r.length > 0);
            const produtos = [];
            for (let i = 1; i < linhas.length; i++) {
                const colunas =
                    linhas[i]
                    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                    .map(c =>
                        c.replace(/^"|"$/g, "").trim()
                    );
                if (colunas.length >= 2) {
                    const id = colunas[0] || i;
                    const nome = colunas[1] || "";
                    const marca = colunas[2] || "";
                    if (!nome) continue;
                    let precoNum = 0;
                    if (colunas[3]) {
                        const precoLimpo =
                            colunas[3]
                            .replace("R$", "")
                            .replace(".", "")
                            .replace(",", ".")
                            .trim();
                        precoNum = parseFloat(precoLimpo) || 0;
                    }
                    const tamanhoP = parseInt(colunas[4]) || 0;
                    const tamanhoM = parseInt(colunas[5]) || 0;
                    const tamanhoG = parseInt(colunas[6]) || 0;
                    const tamanhoGG = parseInt(colunas[7]) || 0;
                    let tamanhosArr = [];
                    if (tamanhoP > 0) tamanhosArr.push("P");
                    if (tamanhoM > 0) tamanhosArr.push("M");
                    if (tamanhoG > 0) tamanhosArr.push("G");
                    if (tamanhoGG > 0) tamanhosArr.push("GG");
                    if(tamanhosArr.length === 0) {
                        tamanhosArr.push("único");
                    }
                    const foto = formatarUrlImagem(colunas[8]);
                    const categoria = colunas[9] || "";
                    const subcategoria = colunas[10] || "";
                    const estoque = parseInt(colunas[11]) || 0;
                    const destaque = colunas[12] || "";
                    produtos.push({
                        id,
                        nome,
                        marca,
                        preco: precoNum,
                        tamanhos: tamanhosArr,
                        foto,
                        categoria,
                        subcategoria,
                        estoque,
                        destaque
                    });
                }
            }
            renderizarProdutos(produtos);
        }
        catch (error) {
            console.error(
                "Erro ao carregar produtos:",
                error
            );
        }
    }

function renderizarProdutos(produtos) {
    const container =
        document.getElementById(
            "products-container"
        );
    if (!container) return;
    container.innerHTML = "";
    produtos.forEach((prod, index) => {
        const tamanhosOptions =
            prod.tamanhos
            .map(
                t =>
                `<option value="${t}">${t}</option>`
            )
            .join("");
        const cardHTML = `
            <div class="product-card">
                ${prod.foto}
                <div class="product-title">
                    ${prod.nome}
                </div>
                <div class="product-brand">
                    ${prod.marca}
                </div>
                <div class="product-price">
                    R$ ${prod.preco.toFixed(2).replace(".", ",")}
                </div>
                <div class="select-group">
                    <label>Tamanho:</label>
                    <select id="size-${index}">
                        ${tamanhosOptions}
                    </select>
                </div>
                <button
                    class="btn-add"
                    onclick="adicionarAoCarrinho(
                        '${prod.nome}',
                        '${prod.marca}',
                        'size-${index}',
                        ${prod.preco},
                        '${prod.foto}'
                    )">
                    Adicionar à Sacola
                </button>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function adicionarAoCarrinho(
    nome,
    marca,
    sizeId,
    preco,
    foto
) {

    const tamanho =
        document.getElementById(sizeId).value;

    sacola.push({
        nome,
        marca,
        tamanho,
        preco,
        foto
    });

    atualizarSacola();

}

function atualizarSacola() {

    const listaCarrinho =
        document.getElementById("lista-carrinho");

    const carrinhoVazio =
        document.querySelector(".carrinho-vazio");

    const total =
        sacola.reduce(
            (soma, item) => soma + item.preco,
            0
        );

    document.getElementById("contagemitens").innerText =
        sacola.length;

    document.getElementById("cart-count").innerText =
        `${sacola.length} item(ns)`;

    document.getElementById("cart-total").innerText =
        `R$ ${total.toFixed(2).replace(".", ",")}`;

    if (sacola.length === 0) {

        carrinhoVazio.style.display = "flex";
        listaCarrinho.innerHTML = "";

        return;
    }

    function removerItem(index){
    sacola.splice(index, 1);
    atualizarSacola();
}

    carrinhoVazio.style.display = "none";

    listaCarrinho.innerHTML = "";

    sacola.forEach((item, index) => {

        listaCarrinho.innerHTML += `
            <div class="item-carrinho">

                <img src="${item.foto}"class="item-info">

                    <div class="item-nome">
                        ${item.nome}
                    </div>

                    <div class="item-tamanho">
                        Tamanho: ${item.tamanho}
                    </div>

                    <div class="item-preco">
                        R$ ${item.preco.toFixed(2).replace(".", ",")}
                    </div>

                </div>

                <button
                    class="btn-remover"
                    onclick="removerItem(${index})">
                    🗑️
                </button>

            </div>
        `;
    });

}


async function pagarComPixDireto() {

    if (sacola.length === 0) {

        alert("Sua sacola está vazia!");
        return;

    }

    try {

        const response =
            await fetch(
                "/api/criar-pagamento",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body: JSON.stringify({
                        itens: sacola
                    })
                }
            );

        const data =
            await response.json();

        if (
            response.ok &&
            data.linkPagamento
        ) {

            window.location.href =
                data.linkPagamento;

        }

    }

    catch (err) {

        console.error(err);

        alert(
            "Erro ao conectar com o servidor."
        );

    }

}

function enviarWhatsApp() {

    if (sacola.length === 0) {

        alert("Sua sacola está vazia!");
        return;

    }

    let textoMensagem =
        "Olá! Gostaria de fazer o seguinte pedido:\n\n";

    let total = 0;

    sacola.forEach((item, index) => {

        textoMensagem +=
            `${index + 1}. ${item.nome}\n` +
            `Marca: ${item.marca}\n` +
            `Tamanho: ${item.tamanho}\n` +
            `Valor: R$ ${item.preco.toFixed(2).replace(".", ",")}\n\n`;

        total += item.preco;

    });

    textoMensagem +=
        `💰 Valor Total: R$ ${total.toFixed(2).replace(".", ",")}`;

    const linkWhatsApp =
        `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(textoMensagem)}`;

    window.open(
        linkWhatsApp,
        "_blank"
    );

}

carregarProdutos();

/*/Abrir e fechar o carrinho na lateral/*/

function abrirCarrinho() {
document.getElementById("carrinho").classList.add("active");
document.getElementById("overlay").classList.add("active");
}

function fecharCarrinho() {
document.getElementById("carrinho").classList.remove("active");
document.getElementById("overlay").classList.remove("active");
}

/*/Controle de abas /*/

const menuLinks = document.querySelectorAll('.menu a');
menuLinks.forEach(link => {

    link.addEventListener('click', function(e) {

        e.preventDefault();

        menuLinks.forEach(item => {
            item.classList.remove('active');
        });

        this.classList.add('active');

    });

});
