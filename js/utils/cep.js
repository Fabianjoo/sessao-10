document.getElementById('cep').addEventListener('input', function () {
    const digits = this.value.replace(/\D/g, '');
    if (digits.length === 8) {
      buscarCEP(digits);
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