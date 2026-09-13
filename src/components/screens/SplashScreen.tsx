import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

// Si usas React Navigation, recibimos 'navigation' por props
export default function SplashScreen({ navigation }: any) {

    useEffect(() => {
        // Simulamos el tiempo de carga de la app (2.5 segundos)
        const timer = setTimeout(() => {
            // Reemplazamos la pantalla para que el usuario no pueda volver atrás con el botón de retroceso
            navigation.replace('Home'); // Cambia 'Home' por tu pantalla de Login si aplica
        }, 2500);

        // Limpiamos el temporizador si el componente se desmonta
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image
                // Asegúrate de colocar el logo de Banorte en tu carpeta /assets
                source={require('../../assets/banorte-logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Ocupa toda la pantalla
        backgroundColor: '#FFFFFF', // Fondo blanco puro
        justifyContent: 'center', // Centra verticalmente
        alignItems: 'center', // Centra horizontalmente
    },
    logo: {
        width: 250, // Ajusta según las proporciones de tu imagen
        height: 100,
    },
});