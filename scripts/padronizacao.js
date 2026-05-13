// Telefone: (00) 00000-0000
document.getElementById('telefone').addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    let r = '';
  
    if (v.length > 0) r += '(' + v.slice(0, 2);
    if (v.length >= 2) r += ') ' + v.slice(2, 7);
    if (v.length >= 7) r += '-' + v.slice(7, 11);
  
    e.target.value = r;
  });
  
  
  // CPF: 000.000.000-00
  document.getElementById('cpf').addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    let r = '';
  
    if (v.length > 0) r += v.slice(0, 3);
    if (v.length >= 3) r += '.' + v.slice(3, 6);
    if (v.length >= 6) r += '.' + v.slice(6, 9);
    if (v.length >= 9) r += '-' + v.slice(9, 11);
  
    e.target.value = r;
  });
  
  
  // CEP: 00000-000
  document.getElementById('cep').addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, '').slice(0, 8);
    let r = '';
  
    if (v.length > 0) r += v.slice(0, 5);
    if (v.length >= 5) r += '-' + v.slice(5, 8);
  
    e.target.value = r;
  });
  
  
  // Número: só números
  document.getElementById('numero').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  });
  
  
  document.getElementById('nomeCliente').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s\-0-9]/g, '');
  });