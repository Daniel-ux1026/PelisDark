import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('catalogo, filtros, detalles y diseno adaptable', async ({ page }) => {
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.hero h1')).toContainText('DUNE');
  await page.getByRole('link',{name:'Peliculas',exact:true}).click();
  await page.getByRole('textbox',{name:'Buscar peliculas y series'}).fill('Dune');
  await expect(page.locator('.poster-grid .movie')).toHaveCount(2);
  await page.getByRole('combobox',{name:'Filtrar por ano'}).selectOption('2024');
  await expect(page.locator('.poster-grid .movie')).toHaveCount(1);
  await page.getByRole('button',{name:'Ver Dune: Parte dos',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button',{name:'Mostrar sinopsis',exact:true}).click();
  await expect(page.locator('.synopsis')).toContainText('Paul');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('link',{name:'Inicio',exact:true}).click();
  await mkdir('../.local/qa',{recursive:true});
  for(const width of [360,390,768,1440,1920]) {
    await page.setViewportSize({width,height:width<500?844:1000});
    await page.locator('img').evaluateAll(images=>images.forEach(img=>img.loading='eager'));
    await expect.poll(()=>page.locator('img').evaluateAll(images=>images.filter(img=>!img.complete).length)).toBe(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(await page.locator('img').evaluateAll(images=>images.every(img=>img.naturalWidth>0))).toBe(true);
    await page.screenshot({path:`../.local/qa/home-${width}.png`,fullPage:true});
    await page.screenshot({path:`../.local/qa/viewport-${width}.png`});
  }
  expect(errors).toEqual([]);
});

test('registro SMTP, lista, puntuacion, multiples perfiles y cierre de sesion', async ({page,request})=>{
  const email=`qa-${Date.now()}@example.test`;
  await page.goto('/');
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await page.getByRole('button',{name:'Crear una cuenta',exact:true}).click();
  await page.getByLabel('Correo electronico',{exact:true}).fill(email);
  await page.getByLabel('Contrasena',{exact:true}).fill('Test-password-12345');
  await page.getByRole('button',{name:'Crear cuenta',exact:true}).click();
  await expect(page.getByLabel('Codigo de verificacion')).toBeVisible();
  const messages=await (await request.get('http://127.0.0.1:8025/api/v1/messages')).json();
  const message=messages.messages.find(m=>m.To.some(t=>t.Address===email));
  expect(message).toBeTruthy();
  const full=await (await request.get(`http://127.0.0.1:8025/api/v1/message/${message.ID}`)).json();
  const code=full.Text.match(/\b[0-9]{6}\b/)[0];
  await page.getByLabel('Codigo de verificacion').fill(code);
  await page.getByRole('button',{name:'Confirmar acceso',exact:true}).click();
  await expect(page.getByRole('button',{name:'Cambiar perfil'})).toBeVisible();
  await page.getByRole('button',{name:'Ver Dune: Parte dos',exact:true}).first().click();
  await page.getByRole('dialog').getByRole('button',{name:'Mi lista',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('anadido');
  await page.getByRole('button',{name:'Puntuar 4 de 5'}).click();
  await expect(page.getByRole('dialog')).toContainText('4 / 5');
  await page.getByRole('button',{name:'Cerrar',exact:true}).click();
  await page.getByRole('link',{name:'Mi lista',exact:true}).click();
  await expect(page.locator('.poster-grid .movie')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.poster-grid .movie')).toHaveCount(1);
  await page.getByRole('button',{name:'Cambiar perfil'}).click();
  await page.getByRole('button',{name:'Nuevo perfil'}).click();
  await page.getByLabel('Nombre',{exact:true}).fill('Familia');
  await page.getByRole('button',{name:'Guardar perfil'}).click();
  await page.getByRole('button',{name:'F Familia',exact:true}).click();
  await expect(page.locator('.poster-grid .movie')).toHaveCount(0);
  await page.getByRole('link',{name:'Configuracion',exact:true}).click();
  await page.getByRole('button',{name:'Cerrar sesion',exact:true}).click();
  await expect(page.getByRole('button',{name:'Entrar',exact:true})).toBeVisible();
});

test('Streamlit muestra el chat o la indicacion de configuracion',async({page})=>{
  await page.goto('http://127.0.0.1:8501');
  await expect(page.getByText('El asistente aun no esta conectado.',{exact:false}).or(page.getByRole('textbox', {name:'¿Que te gustaria ver hoy?'}))).toBeVisible({timeout:30000});
  await page.screenshot({path:'../.local/qa/chatbot.png',fullPage:true});
});
