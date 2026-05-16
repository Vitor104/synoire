import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('rotas (smoke, sem backend)', () => {
  it('renderiza a home', () => {
    renderAt('/')
    expect(
      screen.getByRole('heading', {
        name: /estude junto/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /criar conta/i }).length).toBeGreaterThan(0)
  })

  it('renderiza o painel dentro do shell', () => {
    renderAt('/painel')
    expect(screen.getByRole('heading', { name: /^painel$/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renderiza a lista de hubs', () => {
    renderAt('/hubs')
    expect(
      screen.getByRole('heading', { name: /hubs por concurso/i }),
    ).toBeInTheDocument()
  })

  it('renderiza detalhe de hub por slug', () => {
    renderAt('/hubs/pf')
    expect(
      screen.getByRole('heading', { name: /polícia federal/i }),
    ).toBeInTheDocument()
  })

  it('renderiza sala de estudo imersiva', () => {
    renderAt('/salas/demo')
    expect(
      screen.getByRole('main', {
        name: /^sala de estudo:/i,
      }),
    ).toBeInTheDocument()
  })

  it('sala de estudo não usa o shell lateral', () => {
    renderAt('/salas/demo')
    expect(screen.queryByRole('link', { name: /^hubs$/i })).not.toBeInTheDocument()
  })

  it('renderiza perfil', () => {
    renderAt('/perfil')
    expect(screen.getByRole('heading', { name: /^perfil$/i })).toBeInTheDocument()
  })

  it('renderiza página de entrar', () => {
    renderAt('/entrar')
    expect(screen.getByRole('heading', { name: /^entrar$/i })).toBeInTheDocument()
  })
})
