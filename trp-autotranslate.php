<?php


/**
 * Plugin Name: Translatepress autotranslate
 */

function enqueue_assets()
{

    if (!strpos($_SERVER['REQUEST_URI'], 'trp-edit')) return;
    wp_enqueue_style(
        'trp-autotranslate-style',
        plugin_dir_url(__FILE__) . 'css/style.css',
        array(),
        '1.0.0',
        'all'
    );


    wp_enqueue_script_module(
        'trp-autotranslate-script',
        plugin_dir_url(__FILE__) . 'js/main.js',
        array(),
        '1.0.0',
    );
}

add_action('wp_enqueue_scripts', 'enqueue_assets');



function handle_get_languages()
{
    $languages = trp_get_languages('nodefault');
    wp_send_json($languages);
}


add_action('wp_ajax_get_languages', "handle_get_languages");


function handle_get_default_language()
{
    $languages = trp_get_languages();
    $nodefault_languages = trp_get_languages('nodefault');
    foreach ($languages as $key => $value) {
        if (!array_key_exists($key, $nodefault_languages)) {
            wp_send_json([$key => $value]);
            break;
        }
    }
}

add_action("wp_ajax_get_default_language", 'handle_get_default_language');


function handle_update_dictionary()
{
    $data =  $_POST['data'];
    $translations = $data["translations"];
    $sql_table = 'wp_trp_dictionary_' . strtolower(implode('_', $data['dictionary']));
    global $wpdb;
    foreach ($translations as $tarnslation) {
        $id =  $tarnslation['id'];
        $translated = $tarnslation['translation'];
        $wpdb->update(
            $sql_table,
            array('translated' => $translated, 'status' => 2),
            array('id' => intval($id)),
            array('%s'),
            array('%d')
        );
    }
    wp_send_json($data);
}

add_action('wp_ajax_update_dictionary', "handle_update_dictionary");
