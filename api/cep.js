document.getElementById('cep').addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
    this.value = v;
  
    if (v.replace(/\D/g, '').length === 8) {
      buscarCEP(v.replace(/\D/g, ''));
    } else {
      document.getElementById('endereco').value = '';
    }
  });
  
  async function buscarCEP(cep) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
  
      if (data.erro) return;
  
      const endereco = [data.logradouro, data.bairro, data.localidade, data.uf]
        .filter(Boolean)
        .join(', ');
  
      document.getElementById('endereco').value = endereco;
  
    } catch (e) {}
  }