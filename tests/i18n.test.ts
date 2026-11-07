import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildings, units, technologies } from '../shared/config.js';
import { t, ptBR, useLanguage, locale } from '../src/i18n.js';
test('PT-BR covers every building, troop, technology, description, and benefit', () => {
  for (const definition of [
    ...Object.values(buildings),
    ...Object.values(units),
    ...Object.values(technologies),
  ]) {
    for (const value of [
      definition.name,
      definition.description,
      ...('effect' in definition ? [definition.effect] : []),
    ])
      assert.ok(ptBR[value], `Missing PT-BR translation: ${value}`);
  }
});
test('language selection translates display strings without changing game values', () => {
  useLanguage.getState().setLanguage('pt-BR');
  assert.equal(t('Upgrade building'), 'Melhorar edifício');
  assert.equal(t('Level '), 'Nível ');
  assert.equal(locale(), 'pt-BR');
  assert.equal(t('90% faster construction'), '90% de redução no tempo de construção');
  assert.equal(t('UPGRADE TO LEVEL 3'), 'MELHORAR PARA O NÍVEL 3');
  assert.equal(t('Spearman quantity'), 'Quantidade de Lanceiro');
  const values = { key: 'headquarters', quantity: 12 };
  assert.equal(t(values), values);
  assert.equal(t(12), 12);
  assert.equal(t(null), null);
  useLanguage.getState().setLanguage('en');
  assert.equal(t('Upgrade building'), 'Upgrade building');
  assert.equal(locale(), 'en-US');
  useLanguage.getState().setLanguage('pt-BR');
});
test('legacy persisted completion reports are localized at display time', () => {
  useLanguage.getState().setLanguage('pt-BR');
  const original = { title: 'Headquarters completed', detail: 'Your Headquarters is now level 2.' };
  assert.equal(t(original.title), 'Edifício Principal: construção concluída');
  assert.equal(t(original.detail), 'Edifício Principal agora está no nível 2.');
  assert.equal(original.title, 'Headquarters completed');
  assert.equal(t('Cavalry Equipment researched'), 'Equipamento de Cavalaria: pesquisa concluída');
  assert.equal(t('Barracks unlocked'), 'Quartel liberado');
  assert.equal(t('Wood storage is full'), 'O armazenamento de madeira está cheio');
  assert.equal(t('20 Spearman joined your garrison.'), '20 × Lanceiro chegaram à sua guarnição.');
  assert.equal(
    t('Not enough population capacity. Upgrade your farm.'),
    'Capacidade populacional insuficiente. Melhore sua fazenda.',
  );
});
