import { TestBed } from '@angular/core/testing';
import { SupabaseService } from './supabase.service';

// environment.ts trae supabaseUrl y supabaseAnonKey vacíos: el servicio debe arrancar sin cliente
// y fallar con un mensaje claro en cada llamada.
describe('SupabaseService without configuration', () => {
  let service: SupabaseService;

  beforeEach(() => {
    spyOn(console, 'warn');
    service = TestBed.inject(SupabaseService);
  });

  it('is created and warns about the missing settings', () => {
    expect(service).toBeTruthy();
    expect(console.warn).toHaveBeenCalled();
  });

  it('rejects incidencias calls with a configuration message', async () => {
    await expectAsync(service.getAll()).toBeRejectedWithError(/supabaseUrl y supabaseAnonKey/);
  });

  it('rejects horario calls with a configuration message', async () => {
    await expectAsync(service.getAllHorarios()).toBeRejectedWithError(/Supabase no está configurado/);
  });

  it('rejects notas calls with a configuration message', async () => {
    await expectAsync(service.getAllNotas()).toBeRejectedWithError(/Supabase no está configurado/);
  });
});
