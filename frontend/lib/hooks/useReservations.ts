import { useState, useEffect } from "react";
import {
  reservationApi,
  Reservation,
  GetReservationsParams,
} from "@/lib/api/reservations";

// 予約一覧管理フック
export function useReservations(params?: GetReservationsParams) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 予約一覧を取得する関数
  const fetchReservations = async (fetchParams?: GetReservationsParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationApi.getReservations(fetchParams || params);
      setReservations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予約データの取得に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchReservations();
  }, []);

  // 予約をキャンセルする関数
  const cancelReservation = async (id: string, reason?: string) => {
    try {
      await reservationApi.cancelReservation(id, reason);
      // キャンセル後、一覧を再取得
      await fetchReservations();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予約のキャンセルに失敗しました",
      );
      return false;
    }
  };

  // 特定の予約の支払いステータスを更新する関数
  const updateReservationPaymentStatus = (
    reservationId: string,
    paymentStatus: "pending" | "completed" | "failed",
    paymentMethod?: string,
    paymentReference?: string,
  ) => {
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === reservationId
          ? {
              ...reservation,
              payment_status: paymentStatus,
              payment_method: paymentMethod || reservation.payment_method,
              payment_reference:
                paymentReference || reservation.payment_reference,
              updated_at: new Date().toISOString(),
            }
          : reservation,
      ),
    );
    console.log(
      "予約一覧の支払いステータスを更新:",
      reservationId,
      paymentStatus,
    );
  };

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    cancelReservation,
    refetch: fetchReservations,
    updateReservationPaymentStatus,
  };
}

// 単一予約詳細管理フック
export function useReservation(id: string | null) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservation = async (reservationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationApi.getReservation(reservationId);
      setReservation(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予約データの取得に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReservation(id);
    } else {
      setReservation(null);
      setLoading(false);
      setError(null);
    }
  }, [id]);

  // 予約をキャンセルする関数
  const cancelReservation = async (reservationId: string, reason?: string) => {
    try {
      await reservationApi.cancelReservation(reservationId, reason);
      // キャンセル後、予約データを再取得
      await fetchReservation(reservationId);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予約のキャンセルに失敗しました",
      );
      return false;
    }
  };

  // 予約の支払いステータスを直接更新する関数
  const updatePaymentStatus = (
    paymentStatus: "pending" | "completed" | "failed",
    paymentMethod?: string,
    paymentReference?: string,
  ) => {
    if (reservation) {
      const updatedReservation = {
        ...reservation,
        payment_status: paymentStatus,
        payment_method: paymentMethod || reservation.payment_method,
        payment_reference: paymentReference || reservation.payment_reference,
        updated_at: new Date().toISOString(),
      };
      setReservation(updatedReservation);
      console.log("支払いステータスを直接更新:", updatedReservation);
    }
  };

  return {
    reservation,
    loading,
    error,
    cancelReservation,
    refetch: id ? () => fetchReservation(id) : () => {},
    updatePaymentStatus,
  };
}
