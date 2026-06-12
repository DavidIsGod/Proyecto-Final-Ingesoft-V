import { renderHook, act } from '@testing-library/react-native';
import axios from 'axios';
import { useQrToken } from './useQrToken';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useQrToken', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedAxios.get.mockResolvedValue({
      data: { qrToken: 'token-abc', expiresIn: '60' },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('should initialize with a token and 60s timer when anonymousId is present', async () => {
    const { result } = renderHook(() => useQrToken('test-id', 'auth-token'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.token).toBe('token-abc');
    expect(result.current.timeLeft).toBe(60);
  });

  test('should not initialize if anonymousId is null', () => {
    const { result } = renderHook(() => useQrToken(null, 'auth-token'));

    expect(result.current.token).toBeNull();
  });

  test('should decrement timer every second', async () => {
    const { result } = renderHook(() => useQrToken('test-id', 'auth-token'));

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(59);
  });

  test('should rotate token and reset timer when it reaches 0', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: { qrToken: 'token-initial', expiresIn: '60' } })
      .mockResolvedValueOnce({ data: { qrToken: 'token-rotated', expiresIn: '60' } });

    const { result } = renderHook(() => useQrToken('test-id', 'auth-token'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.token).toBe('token-initial');

    await act(async () => {
      jest.advanceTimersByTime(60000);
      await Promise.resolve();
    });

    expect(result.current.token).toBe('token-rotated');
    expect(result.current.timeLeft).toBe(60);
  });
});
