import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const EMPTY = {
  num_cedula: '', nombres: '', responsable: '', puesto_votacion: '',
  mesa: '', municipio: '', direccion: '', observacion: '', voto: 'NO',
}

const field = (label, icon) => ({ label, icon })
const FIELDS = {
  num_cedula:      field('Número de Cédula', '🪪'),
  nombres:         field('Nombres Completos', '👤'),
  responsable:     field('Responsable', '🧑‍💼'),
  puesto_votacion: field('Puesto de Votación', '🏫'),
  mesa:            field('Mesa', '📋'),
  municipio:       field('Municipio', '🏙️'),
  direccion:       field('Dirección', '📍'),
  observacion:     field('Observación', '💬'),
  voto:            field('¿Ya Votó?', '🗳️'),
}

export default function VotanteForm({ votante, onClose, onSaved, onToast }) {
  const isEdit = !!votante
  const [form, setForm] = useState(isEdit ? { ...votante } : { ...EMPTY })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.num_cedula.trim()) e.num_cedula = 'Requerido'
    if (!form.nombres.trim()) e.nombres = 'Requerido'
    if (!form.responsable) e.responsable = 'Selecciona uno'
    return e
  }

  const handleChange = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      let res
      if (isEdit) {
        res = await supabase.from('votantes').update({
          num_cedula: form.num_cedula.trim(),
          nombres: form.nombres.trim().toUpperCase(),
          responsable: form.responsable,
          puesto_votacion: form.puesto_votacion,
          mesa: form.mesa,
          municipio: form.municipio,
          direccion: form.direccion,
          observacion: form.observacion,
          voto: form.voto,
        }).eq('id', votante.id).select().single()
      } else {
        res = await supabase.from('votantes').insert({
          num_cedula: form.num_cedula.trim(),
          nombres: form.nombres.trim().toUpperCase(),
          responsable: form.responsable,
          puesto_votacion: form.puesto_votacion,
          mesa: form.mesa,
          municipio: form.municipio,
          direccion: form.direccion,
          observacion: form.observacion,
          voto: form.voto,
        }).select().single()
      }
      if (res.error) throw res.error
      onToast({ message: isEdit ? '✅ Votante actualizado' : '✅ Votante agregado', type: 'success' })
      onSaved(res.data, isEdit)
      onClose()
    } catch (e) {
      onToast({ message: '❌ Error: ' + e.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: 'var(--bg2)', borderRadius: '20px 20px 0 0',
            width: '100%', maxWidth: '600px', padding: '24px 20px',
            border: '1px solid var(--border)', borderBottom: 'none',
            maxHeight: '90vh', overflowY: 'auto',
            animation: 'slideUp 0.3s ease',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div style={{ width: '36px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 20px' }} />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '700' }}>
                {isEdit ? '✏️ Editar Votante' : '➕ Nuevo Votante'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>
                {isEdit ? `Consecutivo #${votante.consecutivo}` : 'Completa los campos requeridos *'}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', padding: '6px 10px', fontSize: '16px' }}>✕</button>
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>

            {/* Cédula */}
            <InputField
              label="Número de Cédula *" icon="🪪" type="number"
              value={form.num_cedula} error={errors.num_cedula}
              onChange={v => handleChange('num_cedula', v)}
              placeholder="Ej: 1023456789"
            />

            {/* Nombres */}
            <InputField
              label="Nombres Completos *" icon="👤"
              value={form.nombres} error={errors.nombres}
              onChange={v => handleChange('nombres', v)}
              placeholder="Ej: CARLOS ANDRÉS MARTÍNEZ"
            />

            {/* Responsable */}
            <div>
              <label style={labelStyle}>Responsable *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['Euclides', 'Rebeca', 'Nene'].map(r => (
                  <button
                    key={r}
                    onClick={() => handleChange('responsable', r)}
                    style={{
                      padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                      background: form.responsable === r ? 'var(--accent)' : 'var(--surface)',
                      color: form.responsable === r ? '#fff' : 'var(--text2)',
                      border: `1px solid ${form.responsable === r ? 'var(--accent)' : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}
                  >{r}</button>
                ))}
              </div>
              {errors.responsable && <div style={errStyle}>{errors.responsable}</div>}
            </div>

            {/* 2-col grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputField label="Mesa" icon="📋" value={form.mesa} onChange={v => handleChange('mesa', v)} placeholder="001" />
              <InputField label="Municipio" icon="🏙️" value={form.municipio} onChange={v => handleChange('municipio', v)} placeholder="Bogotá" />
            </div>

            <InputField
              label="Puesto de Votación" icon="🏫"
              value={form.puesto_votacion} onChange={v => handleChange('puesto_votacion', v)}
              placeholder="Ej: IE Simón Bolívar"
            />

            <InputField
              label="Dirección" icon="📍"
              value={form.direccion} onChange={v => handleChange('direccion', v)}
              placeholder="Ej: Cra 15 # 45-20"
            />

            <InputField
              label="Observación" icon="💬" multiline
              value={form.observacion} onChange={v => handleChange('observacion', v)}
              placeholder="Notas adicionales..."
            />

            {/* Voto */}
            <div>
              <label style={labelStyle}>Estado de Voto</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { val: 'NO', label: '⏳ Pendiente', color: 'var(--red)', bg: 'var(--red-bg)', border: 'var(--red-border)' },
                  { val: 'SI', label: '✅ Ya Votó', color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-border)' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => handleChange('voto', opt.val)}
                    style={{
                      padding: '11px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                      background: form.voto === opt.val ? opt.bg : 'var(--surface)',
                      color: form.voto === opt.val ? opt.color : 'var(--text2)',
                      border: `1px solid ${form.voto === opt.val ? opt.border : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{ padding: '13px', borderRadius: '10px', background: 'var(--surface)', color: 'var(--text2)', fontSize: '14px', fontWeight: '600', border: '1px solid var(--border)' }}
            >Cancelar</button>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', color: '#fff',
                background: loading ? 'var(--surface2)' : 'linear-gradient(135deg, var(--accent), #1d4ed8)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(59,130,246,0.3)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '⏳ Guardando...' : isEdit ? '💾 Guardar cambios' : '➕ Agregar votante'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const labelStyle = { fontSize: '12px', fontWeight: '600', color: 'var(--text2)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }
const errStyle = { fontSize: '11px', color: 'var(--red)', marginTop: '4px' }

function InputField({ label, icon, value, onChange, error, placeholder, type = 'text', multiline }) {
  const base = {
    width: '100%', background: 'var(--bg2)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
    borderRadius: '10px', color: 'var(--text)', fontSize: '14px',
    padding: '11px 12px 11px 38px', transition: 'border-color 0.2s', resize: 'none',
    fontFamily: 'var(--font)',
  }
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '11px', top: multiline ? '11px' : '50%', transform: multiline ? 'none' : 'translateY(-50%)', fontSize: '14px', pointerEvents: 'none' }}>{icon}</span>
        {multiline ? (
          <textarea
            rows={3} value={value} placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            style={base}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
          />
        ) : (
          <input
            type={type} value={value} placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            style={base}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
          />
        )}
      </div>
      {error && <div style={errStyle}>⚠️ {error}</div>}
    </div>
  )
}
